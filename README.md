dgKoModulizer
=============

Knockout.js extension for module oragnization.

Article on russian about extension: http://technoblogs.2gis.ru/frontend/knockout-modules/

Code organization format
```javascript
MY.vm.modules.namespace.<ourModule> = {
    _observables: {
        <ourObservable>: <defaultData>,
        <ourComputed>: function(){/*computedCode*/}
    },
    
    <someProperty>: 100500,
    
    _initModule: function(){/*initCode*/},
    
    <function>: function(){/*fBody*/}
}
```
=============

Normal Knockout code

```javascript
var myViewModel = function() {
    // --login block--
    this.login = '';
    this.pass = '';
    
    this.turnOffLoginPreloader = function() {
        //some code
    };
 
    // --user block--
    this.userName = ko.observable('');
    this.userAdress = ko.observable('');
    this.userPhotoLink = ko.observable('');
    this.userFrom = ko.computed(function(){
        return this.userName() + '<' + this.userFrom() + '>';
    });
 
    this.setDefaultPageUser = function() {
        //some code
    };
 
    //-- compose block --
    this.mailTheme = ko.observable('');
    this.mailText = ko.observable('');
    
    this.mailTo = ko.observableArray([]);
    this.mailFrom = ko.observableArray([]);
    
    this.uploadFile = function() {
        //some code
    };
    
    this.sendMail = function() {
        //some code
    };
    
 
    // --incoming mails block--
    this.mails = ko.observableArray([]);
    this.getMail = function() {
        //some code
    };
    
    this.checkMail = function() {
        //some code
    };
    
    // --init block --
    /*
     * Some login function code
     */
    
    setDefaultPageUser();
    turnOffLoginPreloader();
    checkMail();        
}

//Init app
var ViewModel = new myViewModel();
ko.applyBindings(ViewModel);
```
=============

Code with dgKoModulizer

```javascript

//Init namespaces
MY = {};
MY.vm = {};
MY.vm.modules = {};
MY.vm.modules.namespace = {};

/**
 * Login module
 */
MY.vm.modules.namespace.login = {
    
    login: '',
    pass: '',
  
    _initModule: function() {
        /*
         * Some login function code
         */
        turnOffLoginPreloader();
    },
  
    turnOffLoginPreloader: function() {
      
    }
};

/**
 * User module
 */
MY.vm.modules.namespace.user = {
    _observables: {
        userName: '',
        userAdress: '',
        userPhotoLink: '',
        userFrom: function() {
            return this.userName() + '<' + this.userFrom() + '>';
        }        
    },
    
    _initModule: function() {
        setDefaultPageUser();
    },
    
    setDefaultPageUser: function() {
        //some code
    }
};

/**
 * Compose module
 */
MY.vm.modules.namespace.compose = {
    _observables: {
        mailTheme: '',
        mailText: '',
        mailTo: [],
        mailFrom: []        
    },
    
    _initModule: function() {
        turnOffLoginPreloader();
    },
    
    uploadFile: function() {
        //some code
    },
    
    sendMail: function() {
        //some code
    }
};

/**
 * Incoming mail module
 */
MY.vm.modules.namespace.incomingMail = {
    _observables: {
        mails: [],
    },
    
    _initModule: function() {
        checkMail();
    },
    
    getMail: function() {
        //some code
    },
    
    checkMail: function() {
        //some code
    }
};

//Init app
var ViewModel = Modulizer(MY.vm.modules.namespace);
ko.applyBindings(ViewModel);
```
