// Run tests
define([
    'kb/data/annotation' // Genome_annotation API
    ],
    function (GenomeAnnotation, Session, config) {

    'use strict';

    var sayit = function(){ }

    var base_url = 'http://localhost:8000/localhost'
    var service_suffix = {
        object: ':9100',
        genome_annotation:':9103'}


    // Expected values for GenomeAnnotation
    var test_ref = '1013/340/4'
    var test_data = { 
        taxon: '993/616059/2',
        protein: {
            '1013/336/4': {
                'kb|g.166819.CDS.4524': {
                    'aliases': {'30400': ['unknown']},
                    'amino_acid_sequence': 'MPSTRVVFFRHAQSEFNARHSIQGQLDPPLDETGLEQVALAAPRAAAAHDDAVAVFSSDLRRASVTGRAIADALDLALIEDANLRERHLGDLQGLERASLATSVPSAFKVWKSRDRNAAVPGGGESSAGVDARLSAFFQTVSTGNYAGKKIIAVTHGGVLGRLFAGGANREEKRLCQMRRGVGNFAECVVDAYDDGTWRCHYSGWASGRFLEDSEATLQADDVA',
                    'function': 'PF00300 ; PTHR23029 ; KOG0235 ; 5.4.2.1 ; K01834 ; Phosphoglycerate mutase family protein',
                    'md5': 'ef681eca8190313d0843938cb9385258',
                    'protein_id': 'kb|g.166819.CDS.4524'
                }
            }
        }
    }
    // Example feature
    var test_feature_id = 'kb|g.166819.CDS.4524'
    var test_feature = {
        'CDS_properties': {
            'associated_mRNA': ['mRNA', 'kb|g.166819.mRNA.4350'],
            'codes_for_protein_ref': ['1013/336/4', 'kb|g.166819.CDS.4524'],
            'parent_gene': ['gene', 'kb|g.166819.locus.4421']},
            'aliases': {'30400': ['unknown']
        },
        'dna_sequence': 'atgccgtcgaccagagtcgtctttttcaggcacgcgcagtcggagttcaacgctcgacactcaatacaaggccaactggacccaccgcttgacgaaaccggactcgaacaagttgcgctcgcggcgccgagagctgccgctgcgcacgacgacgccgtcgcggtgtttagcagcgacctccgccgcgccagcgtcaccgggcgggcgatcgcagacgccctggacttggcgctcatcgaagacgcgaacctgagagagcgtcacttgggagacttgcaaggactcgagagggcttcgctcgcgacgtcggtgccttcggcattcaaggtgtggaagtcgcgcgaccgcaacgccgccgtgcccggcggcggtgagtcgagcgcgggagtggacgcgcgattgagcgcgtttttccaaacagtaagcacgggaaactacgccggaaagaagatcatcgccgtgacgcacggcggcgtgctcggtcggctgttcgccggcggcgccaaccgcgaggaaaagcgtctgtgccagatgcgacgcggcgtcggaaacttcgccgagtgcgtcgtagacgcttatgacgacgggacgtggaggtgtcattactctggatgggcgtcggggcggtttttagaggattctgaagcgacgcttcaggcggacgacgtcgcctga',
        'dna_sequence_length': 675,
        'feature_id': 'kb|g.166819.CDS.4524',
        'function': 'PF00300 ; PTHR23029 ; KOG0235 ; 5.4.2.1 ; K01834 ; Phosphoglycerate mutase family protein',
        'locations': [['kb|g.166819.c.2', 127779, '-', 675]],
        'md5': '2470551dfcf025b1a288ca3364905394',
        'quality_warnings': ['Not Implemented Yet'],
        'type': 'CDS'
    }

    // GenomeAnnotation API tests
    describe('GenomeAnnotation API', function () {
        var url = base_url + service_suffix.genome_annotation
        console.log('Contacting GenomeAnnotation API at: "' + url + '"')

        // Standard constructor
        var api_obj = GenomeAnnotation({ ref: test_ref, url: url, token: '', timeout:6000})

        // Utility methods
        // ===============

        // Check a numeric value up to 6 digits of precision

        function _check_scalar(v1, v2) {
            if (typeof(v1) == 'number') {
                expect(v1).toBeCloseTo(v2, 6)
            }
            else if (Array.isArray(v1)) {
                // sort arrays (in-place) before comparing them
                v1.sort(); v2.sort()
                expect(v1).toEqual(v2)
            }
            else {
                expect(v1).toEqual(v2)
            }            
        }

        // Check a result

        function _check(name, test_value, result) {
            //console.info("checking GenomeAnnotation method: " + name)
            it(name, function(done) {
                result
                    .then(function(value) {
                        if (Array.isArray(test_value)) {
                            // sort arrays (in-place) before comparing them
                            test_value.sort(); value.sort()
                            expect(test_value).toEqual(value)
                        }
                        else if (typeof(test_value) == 'object') {
                            Object.keys(test_value).map(function(k) {
                                _check_scalar(test_value[k], value[k])
                            })
                        }
                        else {
                            //console.info('simple scalar check. v1=', test_value, 'v2=', value)
                            _check_scalar(test_value, value)
                        }
                        done(); return null
                    }) 
                    .catch(function(err) {
                        console.error('In ' + name + ': ' + err)
                        done.fail('Error in ' + name)
                        return null
                    })
            }, 10000)
        }

        /**
         * Call a method, expecting a result, and failing
         * with a detailed error if something goes wrong.
         *
         * Returns: the result
         */
        function _call_method(meth, arg1) {
            var result_obj = null
            try {
                if (arg1 === undefined) {
                    result_obj = api_obj[meth]()
                }
                else {
                    result_obj = api_obj[meth](arg1)
                }
            }
            catch (exc) {
                it('get result from method ' + meth, function() {
                    var e = exc
                    if (exc.type == 'ThriftError') {
                        console.error('ThriftError', exc)
                        console.error('Examining underlying error object..')
                        e = exc.errorObject
                    }
                    if (e instanceof Error) {
                        console.error('While running method "' + meth + '": ' +
                            'Runtime-error name=' + e.name + ' file=' + e.fileName + ':' + e.lineNumber + 
                            ' message="' + e.message + '"')
                        fail('Internal error (' + e.name + ')')
                    }
                    else {
                        console.error('While running method "' + meth + '": ', e)
                        fail('Unexpected exception in "' + meth + '"')
                    }
                })
            }
            return result_obj
        }

        // Tests
        // =====

        // Run the checks for all zero-argument methods.
        // Each element in the array is a pair of names:
        //   [function-name, test_data-property-name]
        // If the second arg. is null, then skip checking the value

        [
            ['get_taxon', 'taxon'],
            ['get_assembly', null],
            ['get_feature_types', null],
            ['get_proteins', null]
        ].map(function(kvp) { 
            var meth = kvp[0], attr = kvp[1]
            var test_value = test_data[attr] // will be undefined if attr==null
            var result_obj = _call_method(meth)
            // method returned, now check result value 
            if (result_obj !== null && test_value !== undefined) {
                _check(meth, test_value, result_obj)
            }
        })

        // Run the checks for methods taking a list of identifiers

        var _flist = ['feature_type_descriptions', 'feature_type_counts',
        'feature_ids', 'features', 'feature_locations',
        'feature_publications', 'feature_dna', 'feature_functions',
        'feature_aliases', 'cds_by_gene', 'cds_by_mrna', 'gene_by_cds',
        'gene_by_mrna', 'mrna_by_cds', 'mrna_by_gene']

        // (1) Empty list input => Error
        _flist.map(function(meth) {
            var func_name = 'get_' + meth
            it ('Empty list input', function(done) {
                var func = function() { api_obj[func_name]([]) }
                expect(func).toThrow()
                done()
                return null
            }, 1000)
        })
        // (2) Check values returned for a single feature.
        // Expected values are stored in `test_data` object
        // created at the top of the file.
        var timeout = 20000

        it('has the feature with the same sequence length', 
            function(done) {
                api_obj.get_features([test_feature_id]).then(function(val) {
                    var v = val[test_feature_id]
                    expect(v.feature_dna_sequence_length).toEqual(675)
                    done(); return null
            })
        }, timeout)

        // it('has a protein with the same MD5 hash', 
        //     function(done) {
        //         api_obj.get_proteins().then(function(val) {
        //             Object.keys(test_data.proteins).forEach(function(key) {
        //                 console.info('@@ protein[' + key + ']=', val[key])
        //                 expect(val[key].protein_md5).toEqual(test_data.proteins[key].md5)
        //                 done(); return null
        //             })
        //             expect(val.dna_sequence_length).toEqual(675)
        //             done(); return null
        //     })
        // }, timeout)

        // Check constructor variants

        sayit = function(m) {
            console.debug('Test GenomeAnnotation API constructor ' + m)
        }

        sayit('without config')
        it('constructor without config', function (done) {
             var ctor = function() { GenomeAnnotation() }
             expect(ctor).toThrow()
             done()
             return null
         }, 1000)

        sayit('with empty config')
        it('constructor with empty config', function (done) {
             var ctor = function() { GenomeAnnotation({}) }
             expect(ctor).toThrow()
             done()
             return null
         }, 1000)

        sayit('with config missing ref')
        it('constructor config missing ref', function (done) {
            var ctor = function() { 
                GenomeAnnotation({url: url, token: '', timeout:6000}) 
            }
            expect(ctor).toThrow()
            done()
            return null
         }, 1000)

        sayit('config missing url')
        it('constructor config missing url', function (done) {
            var ctor = function() { 
                GenomeAnnotation({ref: test_ref, token: '', timeout:6000}) 
            }
            expect(ctor).toThrow()
            done()
            return null
         }, 1000)

        sayit('config null token')
        it('constructor config null token', function (done) {
            var ctor = function() { 
                GenomeAnnotation({ref: test_ref, url: url, token: null, timeout:6000}) 
            }
            expect(ctor).not.toThrow()
            done()
            return null
         }, 1000)

        sayit('config bad token')
        it('constructor config bad token', function (done) {
            var ctor = function() { 
                GenomeAnnotation({ref: test_ref, url: url, token: "hello, world", timeout:6000}) 
            }
            expect(ctor).toThrow()
            done()
            return null
         }, 1000)

        sayit('no timeout')
        it('constructor config no timeout', function (done) {
            var ctor = function() { 
                GenomeAnnotation({ref: test_ref, url: url, token: ''}) 
            }
            expect(ctor).not.toThrow()
            done()
            return null
         }, 1000)

        sayit('bad url')
        it('client bad url', function (done) {
            var runner = function() { 
                var c = GenomeAnnotation({ref: test_ref, url: 'http://localhost:99', 
                       token: ''}) 
                    .client()
                console.info("Bad URL Client: ", c)
            }
            expect(runner).toThrow()
            done()
            return null
         }, 1000)

    })
})

