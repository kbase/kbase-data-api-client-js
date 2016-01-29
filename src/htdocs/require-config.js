'use strict';

require.config({
    baseUrl: '/',
    catchError: true,
    onError: function (err) {
        alert("RequireJS Error:" + err);
    },
    paths: {
        // External Dependencies
        // ----------------------
        jquery: 'bower_components/jquery/jquery',
        underscore: 'bower_components/underscore/underscore',
        bluebird: 'bower_components/bluebird/bluebird',
        bootstrap: 'bower_components/bootstrap/js/bootstrap',
        bootstrap_css: 'bower_components/bootstrap/css/bootstrap',
        'font-awesome': 'bower_components/font-awesome/css/font-awesome',
        text: 'bower_components/requirejs-text/text',
        yaml: 'bower_components/require-yaml/yaml',
        'js-yaml': 'bower_components/js-yaml/js-yaml',
        css: 'bower_components/require-css/css',
        // NB the taxon thrift libraries are generated, wrapped, and installed
        // by grunt tasks.
//        taxon_types: 'js/thrift/taxon/taxon_types',
 //       taxon_service: 'js/thrift/taxon/thrift_service',
        // The main product
   //     kb_data_taxon: 'js/Taxon'
        
        
        //kb_common_html:    'bower_components/kbase-common-js/kb/common/html',
        //kb_common_cookie:  'bower_components/kbase-common-js/kb/common/cookie',
        //kb_common_logger:  'bower_components/kbase-common-js/kb/common/logger',
        //kb_common_session: 'bower_components/kbase-common-js/kb/common/session'
    },
    shim: {
        bootstrap: {
            deps: ['jquery', 'css!bootstrap_css']
        }
    },
    map: {
        '*': {
             'css': 'css',
            'promise': 'bluebird'
        }
    }
});