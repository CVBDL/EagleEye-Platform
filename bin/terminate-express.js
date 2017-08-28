var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'EagleEyePlatformExpress',
  description: 'EagleEye Platform Web Server',
  script: 'c:\\www\\EagleEye-Platform\\bin\\www'
});

// Listen for the "uninstall" event so we know when it's done.
svc.on('uninstall',function(){
  console.log('Uninstall complete.');
  console.log('The service exists: ',svc.exists);
});

svc.on('error', function(error) {
  console.log(error);
});

// Uninstall the service.
svc.uninstall();
