/*global define*/
/*jslint white: true, browser: true*/
define([
    'kb/thrift/core'
], function (Thrift) {
    
    
    var ClientException = function (reason, message, suggestion) {
        this.name = 'ClientException';
        this.reason = reason;
        this.message = message;
        this.suggestion = suggestion;
    };
    ClientException.prototype = Object.create(Error.prototype);
    ClientException.prototype.constructor = ClientException;
    
    function validateCommonApiArgs(args) {
        // Construction argument contract enforcement, throw useful exceptions
        if (!args) {
            throw new ClientException({
                type: 'ArgumentError',
                name: 'ConfigurationObjectMissing',
                message: 'Configuration object missing',
                suggestion: 'This is an API usage error; the taxon factory object is required to have a single configuration object as an argument.'
            });
        }
        if (!args.ref) {
            throw new ClientException({
                type: 'ArgumentError',
                name: 'ObjectReferenceMissing',
                message: 'Object reference "ref" missing',
                suggestion: 'The object reference is provided as in the "ref" argument to the config property'
            });
        }
        if (!args.url) {
            throw new ClientException({
                type: 'ArgumentError',
                name: 'UrlMissing',
                message: 'Cannot find a url for the data api',
                suggestion: 'The url is provided as in the "url" argument property'
            });

        }
        //if (!args.token) {
        //    // patch:
        //    args.token = '';
        //}
//        if (!args.token) {
//            throw new ClientException({
//                type: 'ArgumentError',
//                name: 'AuthTokenMissing',
//                message: 'No Authorization found; Authorization is required for the data api',
//                suggestion: 'The authorization is provided in the "token" argument" property'
//            });
//        }
        if (!args.timeout) {
            args.timeout = 30000;
        }
        return args;
    }
   
   return {
        ClientException: ClientException,
        validateCommonApiArgs: validateCommonApiArgs
   };
});


