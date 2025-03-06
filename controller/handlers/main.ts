import {connection,Message} from 'websocket';


class Request{
    id:string
    constructor(id:string,timeout:number){

    }
    response()
}

type IMessageJSON={
    type:'request'|'info'
    id:string
    body:{[x:string]:any}
}



export class ConnectionHandlers{
    requestQue:string
    connection:connection
    constructor(connection:connection){
        this.connection=connection
        this.connection.on('message',this.messageIntro)
    }
    messageIntro(message:Message){
        if (message.type === 'utf8') {
            try {
                const messageJson = JSON.parse(message.utf8Data)
                
            } catch (error) {
                
            }
            this.connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            this.connection.sendUTF('')
            // console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            // connection.sendBytes(message.binaryData);
        }
    }
    
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
    exit(fn:()=>void){
        fn()
    }
}