require([
    'kb/data/genomeAnnotation',
    'htdocs/utils',
    'yaml!config/config.yml'
], function (GenomeAnnotation, utils, config) {
    'use strict';
    var methods = [
        {
            name: 'taxon',
            type: 'string'
        },
        {
            name: 'assembly',
            type: 'string'
        },
        {
            name: 'feature_types',
            type: 'set'
        },
        {
            name: 'feature_type_descriptions',
            type: 'object',
            limit: 100
        },
        {
            name: 'feature_type_counts',
            type: 'object',
            limit: 100,
            args: [
                function (results) {
                    return Object.keys(results.feature_type_descriptions.result);
                }
            ]
        },
        {
            name: 'feature_ids',
            type: 'object',
            args: [
                {
//                    type_list: [],
//                    region_list: [],
//                    function_list: [],
//                    alias_list: []
                },
                // type, region, function, alias
                'type'
            ]
        },
        {
            name: 'features',
            type: 'object',
            args: [
                function (results) {
                    // need to find some feature ids to use... so use the first
                    // type reported in feature_types
                    if (results.feature_types.result && results.feature_types.result.length > 0) {
                        var type = results.feature_types.result[0];
                        return results.feature_ids.result.by_type[type].slice(0, 5);
                    }
                    return [];
                }
            ]

        },
        {
            name: 'proteins',
            type: 'object'
        },
        {
            name: 'feature_locations',
            type: 'object',
            args: [
                function (results) {
                    if (results.feature_types.result && results.feature_types.result.length > 0) {
                        var type = results.feature_types.result[0];
                        return results.feature_ids.result.by_type[type].slice(0, 5);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'feature_publications',
            type: 'object',
            args: [
                function (results) {
                    if (results.feature_types.result && results.feature_types.result.length > 0) {
                        var type = results.feature_types.result[0];
                        return results.feature_ids.result.by_type[type].slice(0, 5);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'feature_dna',
            type: 'object',
            args: [
                function (results) {
                    if (results.feature_types.result && results.feature_types.result.length > 0) {
                        var type = results.feature_types.result[0];
                        return results.feature_ids.result.by_type[type].slice(0, 5);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'feature_functions',
            type: 'object',
            args: [
                function (results) {
                    if (results.feature_types.result && results.feature_types.result.length > 0) {
                        var type = results.feature_types.result[0];
                        return results.feature_ids.result.by_type[type].slice(0, 5);
                    }
                    return [];
                }
            ]
        },
        // does not load, check out spec and impl.
        {
            name: 'feature_aliases',
            type: 'object',
            args: [
                function (results) {
                    if (results.feature_ids.result.by_type.CDS) {
                        return results.feature_ids.result.by_type.CDS.slice(0, 5);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'cds_by_gene',
            type: 'set',
            args: [
                function (results) {
                    if (results.feature_ids.result.by_type.gene) {
                        return results.feature_ids.result.by_type.gene.slice(0, 1);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'cds_by_mrna',
            type: 'set',
            args: [
                function (results) {
                    if (results.feature_ids.result.by_type.mRNA) {
                        return results.feature_ids.result.by_type.mRNA.slice(0, 1);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'gene_by_cds',
            type: 'object',
            args: [
                function (results) {
                    //console.log('CDS');
                    //console.log(results.feature_ids.by_type.CDS.slice(0, 5));
                    if (results.feature_ids.result.by_type.CDS) {
                        return results.feature_ids.result.by_type.CDS.slice(0, 1);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'gene_by_mrna',
            type: 'object',
            args: [
                function (results) {
                    //console.log('mRNA');
                    //console.log(results.feature_ids.by_type.mRNA.slice(0, 5));
                    if (results.feature_ids.result.by_type.mRNA) {
                        return results.feature_ids.result.by_type.mRNA.slice(0, 1);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'mrna_by_cds',
            type: 'object',
            args: [
                function (results) {
                    //console.log('mRNA');
                    //console.log(results.feature_ids.by_type.mRNA.slice(0, 5));
                    if (results.feature_ids.result.by_type.CDS) {
                        return results.feature_ids.result.by_type.CDS.slice(0, 1);
                    }
                    return [];
                }
            ]
        },
        {
            name: 'mrna_by_gene',
            type: 'object',
            args: [
                function (results) {
                    //console.log('mRNA');
                    //console.log(results.feature_ids.by_type.mRNA.slice(0, 5));
                    if (results.feature_ids.result.by_type.gene) {
                        return results.feature_ids.result.by_type.gene.slice(0, 1);
                    }
                    return [];
                }
            ]
        }
    ];
    config.serviceUrl = config.genomeAnnotationUrl;
    utils.displayObject(GenomeAnnotation, methods, config);
});