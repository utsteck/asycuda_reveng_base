Requirements
Windows 7/8/10/11
JAVA v8

You can launch the app by double clicking ./resouces/bin/AW433_SO2251_2FA.jnlp

You can open the jnlp file in VS-Code for inspection.

As far as I understand,

Execution Starts at awclient.jar

un.kernel.client.AWDesktopMain is the main class

and these args needs to be passed into the main function

'https://customs.gov.bd/web433so2251/help/','//customs.gov.bd:2006/','-dout','Solaris433_2FA','N','Y'
