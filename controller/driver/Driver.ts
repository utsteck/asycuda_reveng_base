import {connection,Message,request} from 'websocket';
import {generate} from 'randomstring'
import { server as WebSocketServer } from "websocket";
import {createServer, Server} from 'http';
import {remove as _remove, identity} from 'lodash';
import { sleep } from './utils';

class Request{
    id:string
    data:any
    promise:Promise<any>
    resolve: (value: any | PromiseLike<any>) => void
    reject: (reason?: any) => void
    timeout:NodeJS.Timeout
    constructor(data:any){
        this.id=generate({
            length:24,
            charset:'alphanumeric'
        })
        this.data=data
        this.promise= new Promise((res,rej)=>{
            this.resolve=res
            this.reject=rej
        })
    }
    getPayload(){
        return JSON.stringify({
            type:"req",
            id:this.id,
            body:this.data
        })

    }
    response(){
        return this.promise
    }
}

type IMessageJSON={
    type:'req'|'res'|'inf'
    id:string
    body:any
}


class RequestManager{
    connection:connection
    requestQue:Request[]=[]
    constructor(connection:connection){
        this.connection=connection
        this.connection.on('message',this.#messageHandler)
    }
    #messageHandler(data:Message){
        if(data.type=='utf8'){
            const messageJSON:IMessageJSON=JSON.parse(data.utf8Data)
            if(messageJSON.type='res'){
                this.#resolveResponse(messageJSON)
            }
        }
    }
    #resolveResponse(message:IMessageJSON){
        let req=this.#findRequestById(message.id)
        if(req){
            req.resolve(message.body)
            this.#removeRequest(req.id)
            clearTimeout(req.timeout)
        }
    }
    #removeRequest(id:string){
        const req=_remove(this.requestQue,e=>{
            e.id==id
        })
        if(req && req.length!=0){
            clearTimeout(req[0].timeout)
        }
    }
    #findRequestById(id:string){
        return this.requestQue.find(e=>{
            e.id==id
        })
    }
    makeRequest(data:any,timeout:number=2000){
        const req=new Request(data)
        req.timeout=setTimeout(()=>{
            this.#removeRequest(req.id)
        },timeout)
        this.connection.send(req.getPayload())
        this.requestQue.push(req)
        return req
    }
}
class DriverCom{
    requestManager:RequestManager
    constructor(connection:connection){
        this.requestManager=new RequestManager(connection)
    }

    async findElementById(id:string,timeout:number=30000,step:number=500){
        let t=0
        while(t<timeout){
            try {
                await this.requestManager.makeRequest({
                    name:"findElement",
                    by:'id',
                    value:id
                }).response()
            } catch (error) {
                
            }
            
        }
        throw new Error("Element Not found.")
    }

}


export class Driver{
    requestQue:string
    connection:connection
    server: Server
    wsServer: WebSocketServer
    connectionPromise:{
        promise:Promise<void>,
        resolve:(value:void)=>void,
        reject: (reason?: any) => void,
    }
    constructor(path:string,port:number){
        this.setupServer(port);
        this.launchClient(path);

    }
    setupServer(port:number){  
        this.server = createServer(function(request, response) {
            console.log((new Date()) + ' Received request for ' + request.url);
            response.writeHead(404);
            response.end();
        });
        this.server.listen(port, function() {
            console.log((new Date()) + ' Server is listening on port 8080');
        });

        this.wsServer = new WebSocketServer({
            httpServer: this.server,
            autoAcceptConnections: false
        });
        this.wsServer.on('request', (request)=> {
            this.acceptConnection(request)
        });
        

        // @ts-ignore
        this.connectionPromise={}
        this.connectionPromise.promise=new Promise((rej,res)=>{
            this.connectionPromise.resolve=res
            this.connectionPromise.reject=rej
        })

        
    }

    launchClient(path:string){
        // Logic and parameter to spawn Java client exe or JAR
    }
    async waitForClient(){
        await this.connectionPromise.promise 
        return new DriverCom(this.connection)
    }
    acceptConnection(request:request){
        if (this.cors(request.origin)) {
            this.connection=request.accept('echo-protocol', request.origin)
            this.connection.on('close', this.connectionClosed);
            this.connectionPromise.resolve()
            console.log((new Date()) + ' Connection accepted.');
            return;
        }else{
            request.reject();
            this.connectionPromise.reject()
            console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
            return;
        }
        

    }
    cors(origin:string) {
        if(this.connection!=null){
            return origin=='JavaClient';
        }
        else return false
    }
    connectionClosed(reasonCode:number, description:string){   
            console.log((new Date()) + ' Peer ' + this.connection.remoteAddress + ' disconnected.'+'reasonCode:'+reasonCode+'description'+description);
    }
}


// messageIntro(message:Message){
//     if (message.type === 'utf8') {
//         try {
//             const messageJson = JSON.parse(message.utf8Data)
            
//         } catch (error) {
            
//         }
//         this.connection.sendUTF(message.utf8Data);
//     }
//     else if (message.type === 'binary') {
//         this.connection.sendUTF('')
//         // console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
//         // connection.sendBytes(message.binaryData);
//     }
// }

// connection.on('close', function(reasonCode, description) {
//     console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
// });
// exit(fn:()=>void){
//     fn()
// }