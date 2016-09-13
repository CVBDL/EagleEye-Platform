var Service  =  require('node-windows').Service;

// Create a new service object
var svc  =  new  Service({  
  name: 'EagleEyePlatformExpress',
  description:'EagleEye Platform Web Server',
  script: 'c:\\www\\EagleEye-Platform\\app.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install', function() {  
  svc.start();
});

svc.on('error', function(error) {
  console.log(error);
});

svc.install();
