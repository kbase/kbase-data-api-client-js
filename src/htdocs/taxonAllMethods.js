require([
    'kb/data/taxon',
    'htdocs/utils',
    'yaml!config/config.yml'
], function (Taxon, utils, config) {
    'use strict';
    
    var methods = [
        {
            name: 'parent',
            type: 'string',
            use: true
        },
        {
            name: 'children',
            type: 'array',
            use: true
        },
        {
            name: 'genome_annotations',
            type: 'array',
            use: true
        },
        {
            name: 'scientific_lineage',
            type: 'array',
            use: true
        },
        {
            name: 'scientific_name',
            type: 'string',
            use: true
        },
        {
            name: 'taxonomic_id',
            type: 'string',
            use: true
        },
        {
            name: 'kingdom',
            type: 'string',
            use: true
        },
        {
            name: 'domain',
            type: 'string',
            use: true
        },
        {
            name: 'genetic_code',
            type: 'number',
            use: true
        },
        {
            name: 'aliases',
            type: 'array',
            use: true
        }
    ];
    config.serviceUrl = config.taxonUrl;
    utils.displayObject(Taxon, methods, config);

});
