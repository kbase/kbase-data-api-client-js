require([
    'kb/data/assembly',
    'htdocs/utils',
    'yaml!config/config.yml'
], function (Assembly, utils, config) {
    'use strict';

    var methods = [
        {
            name: 'assembly_id',
            type: 'string'
        },
        {
            name: 'genome_annotations',
            type: 'set'
        },
        {
            name: 'external_source_info',
            type: 'object'
        },
        {
            name: 'stats',
            type: 'object'
        },
        {
            name: 'number_contigs',
            type: 'number'
        },
        {
            name: 'gc_content',
            type: 'number'
        },
        {
            name: 'dna_size',
            type: 'number'
        },
        {
            name: 'contig_ids',
            type: 'set'
        },
        {
            name: 'contig_lengths',
            type: 'object',
            args: [
                function (results) {
                    return results.contig_ids.result.slice(0, 5);
                }
            ]
        },
        {
            name: 'contig_gc_content',
            type: 'object',
            args: [
                function (results) {
                    return results.contig_ids.result.slice(0, 5);
                }
            ]
        },
        {
            name: 'contigs',
            type: 'object',
            args: [
                function (results) {
                    return results.contig_ids.result.slice(0, 2);
                }
            ]
        }
    ];

    config.serviceUrl = config.assemblyUrl;
    utils.displayObject(Assembly, methods, config);
});
