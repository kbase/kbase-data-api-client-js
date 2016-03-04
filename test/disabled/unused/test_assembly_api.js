/*global define,expect,it*/
/*jslint white:true*/
define([
    'bluebird',
    'kb/common/session',
    'kb/data/assembly'
],
    function (Promise, Session, Assembly) {
        'use strict';

        /*
         external_source=KBase
         name=kb|g.166819
         external_source_origination_date=1417667693.19
         assembly_id=kb|g.166819
         notes=Unknown
         external_source_id=kb|g.166819.fasta
         fasta_handle_ref=bce59064-81e6-440a-a8dc-df8a8cb9b446
         num_contigs=21
         gc_content=0.604372789834
         type=Unknown
         dna_size=13204888
         md5=19865cecd49346e76abad5ec3eda08e9        
         */
        // Expected values for Assembly
        var test_ref = '1013/92/2'
        var test_data = {
            assembly_id: 'kb|g.166819',
            genome_annotations: [],
            ext_info: {
                external_source: 'KBase',
                external_source_id: 'kb|g.166819.fasta',
                external_source_origination_date: '1417667693.19'
            },
            stats: {
                num_contigs: 21,
                dna_size: 13204888,
                gc_content: 0.604372789834
            },
            num_contigs: 21,
            gc_content: 0.604372789834,
            dna_size: 13204888,
            contig_lengths: {
                'kb|g.166819.c.0': 1152508,
                'kb|g.166819.c.1': 895087,
                'kb|g.166819.c.10': 593542,
                'kb|g.166819.c.11': 538963,
                'kb|g.166819.c.12': 528469,
                'kb|g.166819.c.13': 708927,
                'kb|g.166819.c.14': 468366,
                'kb|g.166819.c.15': 428333,
                'kb|g.166819.c.16': 366173,
                'kb|g.166819.c.17': 149386,
                'kb|g.166819.c.18': 154676,
                'kb|g.166819.c.19': 549133,
                'kb|g.166819.c.2': 982987,
                'kb|g.166819.c.20': 321799,
                'kb|g.166819.c.3': 930724,
                'kb|g.166819.c.4': 847696,
                'kb|g.166819.c.5': 818664,
                'kb|g.166819.c.6': 783246,
                'kb|g.166819.c.7': 701771,
                'kb|g.166819.c.8': 670853,
                'kb|g.166819.c.9': 613585
            },
            contig_gc_content: {
                'kb|g.166819.c.0': 0.6035611032634914,
                'kb|g.166819.c.1': 0.5582697547836132,
                'kb|g.166819.c.10': 0.6158603771931893,
                'kb|g.166819.c.11': 0.6046184988579921,
                'kb|g.166819.c.12': 0.6113414410305997,
                'kb|g.166819.c.13': 0.6016289406384578,
                'kb|g.166819.c.14': 0.6143891742782354,
                'kb|g.166819.c.15': 0.6193125442120967,
                'kb|g.166819.c.16': 0.6193711715500597,
                'kb|g.166819.c.17': 0.5259328183363903,
                'kb|g.166819.c.18': 0.6344035273733482,
                'kb|g.166819.c.19': 0.616469962650214,
                'kb|g.166819.c.2': 0.6008360232637868,
                'kb|g.166819.c.20': 0.6065680751027815,
                'kb|g.166819.c.3': 0.6048882375441055,
                'kb|g.166819.c.4': 0.6060922783639417,
                'kb|g.166819.c.5': 0.6048989573255938,
                'kb|g.166819.c.6': 0.6067978642725274,
                'kb|g.166819.c.7': 0.6075557411178291,
                'kb|g.166819.c.8': 0.6148127831283455,
                'kb|g.166819.c.9': 0.6151714921323044
            },
        }
        test_data.contig_id_list = Object.keys(test_data.contig_gc_content);

        var test_data = {
            "assembly_id": "Rhodobacter_sphaeroides_2.4.1",
            "genome_annotations": [
                "509/10/2",
                "436/2/1",
                "1384/14/1",
                "644/2/1",
                "16/25/1",
                "15/7/1",
                "2234/2/1",
                "643/4/1",
                "15/8/1",
                "2234/3/1",
                "16/23/1",
                "436/3/1"
            ],
            "gc_content": 0.6878941606703661,
            "external_source_info": {
                "external_source": "User uploaded data",
                "external_source_id": "USER",
                "external_source_origination_date": "Unknown"
            },
            "stats": {
                "num_contigs": 7,
                "dna_size": 4602977,
                "gc_content": 0.6878941606703661
            },
            "number_contigs": 7,
            "dna_size": 4602977,
            "contig_ids": [
                "NC_007488",
                "NC_007489",
                "NC_007490",
                "NC_007493",
                "NC_007494",
                "NC_009007",
                "NC_009008"
            ]
        };

        // Assembly API tests
        describe('Assembly API', function () {

            var token,
                url = 'https://ci.kbase.us/services/data/assembly',
                taxon_ref = '1779/474234/1',
                // DELETE ME
                username = 'eapearson',
                password = 'Oc3an1cWhal3',
                timeout = 6000;


            // Standard constructor
            var api_obj = Assembly({ref: test_ref, url: url, token: '', timeout: 6000})

            // Utility methods
            // ===============

            // Check a numeric value up to 6 digits of precision

            function check_scalar(v1, v2) {
                if (typeof (v1) === 'number') {
                    expect(v1).toBeCloseTo(v2, 6)
                } else if (Array.isArray(v1)) {
                    // sort arrays (in-place) before comparing them
                    v1.sort();
                    v2.sort();
                    expect(v1).toEqual(v2);
                } else {
                    expect(v1).toEqual(v2);
                }
            }

            // Check a result

            function check(name, test_value, result) {
                //console.info("checking Assembly method: " + name)
                it(name, function (done) {
                    result
                        .then(function (value) {
                            if (Array.isArray(test_value)) {
                                // sort arrays (in-place) before comparing them
                                test_value.sort();
                                value.sort();
                                expect(test_value).toEqual(value);
                            } else if (typeof (test_value) === 'object') {
                                Object.keys(test_value).map(function (k) {
                                    check_scalar(test_value[k], value[k]);
                                });
                            } else {
                                //console.info('simple scalar check. v1=', test_value, 'v2=', value)
                                check_scalar(test_value, value);
                            }
                            done();
                            return null;
                        })
                        .catch(function (err) {
                            console.error(err);
                            done.fail('Error in ' + name);
                            return null;
                        });
                }, 10000);
            }

            /**
             * Call a method, expecting a result, and failing
             * with a detailed error if something goes wrong.
             *
             * Returns: the result
             */
            function _call_method(meth) {
                var result_obj = null
                try {
                    result_obj = api_obj[meth]()
                } catch (exc) {
                    it('get result from method ' + meth, function () {
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
                        } else {
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

            [['get_assembly_id', 'assembly_id'],
                ['get_genome_annotations', 'genome_annotations'],
                ['get_external_source_info', 'ext_info'],
                ['get_stats', 'stats'],
                ['get_number_contigs', 'num_contigs'],
                ['get_gc_content', 'gc_content'],
                ['get_dna_size', 'dna_size'],
            ]
                .map(function (kvp) {
                    var meth = kvp[0], attr = kvp[1]
                    var test_value = test_data[attr]
                    var result_obj = _call_method(meth)
                    // method returned, now check result value 
                    if (result_obj !== null) {
                        check(meth, test_value, result_obj)
                    }
                })

            // Run the checks for methods taking a list of contigs


            // (1) Empty list
            // get_contig_lengths
            it('calls get_contig_lengths() for an empty list', function (done) {
                function x() {
                    api_obj.get_contig_lengths([])
                }
                expect(x).toThrow()
                done();
                return null
            }, 10000)
            // get_contig_gc_content
            it('calls get_contig_gc_content() for an empty list', function (done) {
                function x() {
                    api_obj.get_contig_gc_content([])
                }
                expect(x).toThrow()
                done();
                return null
            }, 10000)
            // get_contigs
            it('calls get_contigs() for an empty list', function (done) {
                function x() {
                    api_obj.get_contigs([])
                }
                expect(x).toThrow()
                done();
                return null
            }, 10000)


            // Get 1..N contigs
            // get_contig_lengths
            var contigall = test_data.contig_id_list
            var contig_cur = [];

            // Test with lists of contigs
            // ---------------------------
            // over 1.. contigall.length, or some limit
            var N_contigs = Math.min(contigall.length, 4) // XXX: change to 10
            // functions called inside the loop
            var contig_length_func = function (done) {
                api_obj.get_contig_lengths(contig_cur)
                    .then(function (result) {
                        contig_cur.forEach(function (key) {
                            expect(result[key]).toEqual(test_data.contig_lengths[key])
                        })
                    })
                done();
                return null
            }
            var contig_gc_func = function (done) {
                api_obj.get_contig_gc_content(contig_cur)
                    .then(function (result) {
                        contig_cur.forEach(function (key) {
                            expect(result[key]).not.toBe(undefined)
                        })
                    })
                done();
                return null
            }
            // Run the loop
            for (var i = 1; i <= N_contigs; i++) {

                contig_cur = contigall.slice(0, i)

                it('get_contig_lengths for ' + i + ' contigs', contig_length_func, 10000)
                //it('get_contig_gc_content for ' + i + ' contigs', contig_gc_func, 10000)
            }

            // Check constructor variants
            // -----------------------------
            it('constructor without config', function (done) {
                var ctor = function () {
                    Assembly()
                }
                expect(ctor).toThrow()
                done()
                return null
            }, 1000)

            it('constructor with empty config', function (done) {
                var ctor = function () {
                    Assembly({})
                }
                expect(ctor).toThrow()
                done()
                return null
            }, 1000)

            it('constructor config missing ref', function (done) {
                var ctor = function () {
                    Assembly({url: url, token: '', timeout: 6000})
                }
                expect(ctor).toThrow()
                done()
                return null
            }, 1000)

            it('constructor config missing url', function (done) {
                var ctor = function () {
                    Assembly({ref: test_ref, token: '', timeout: 6000})
                }
                expect(ctor).toThrow()
                done()
                return null
            }, 1000)

            it('constructor config null token', function (done) {
                var ctor = function () {
                    Assembly({ref: test_ref, url: url, token: null, timeout: 6000})
                }
                expect(ctor).not.toThrow()
                done()
                return null
            }, 1000)

            it('constructor config bad token', function (done) {
                var ctor = function () {
                    Assembly({ref: test_ref, url: url, token: "hello, world", timeout: 6000})
                }
                expect(ctor).toThrow()
                done()
                return null
            }, 1000)

            it('constructor config no timeout', function (done) {
                var ctor = function () {
                    Assembly({ref: test_ref, url: url, token: ''})
                }
                expect(ctor).not.toThrow()
                done()
                return null
            }, 1000)

            it('client bad url', function (done) {
                var runner = function () {
                    var c = Assembly({ref: test_ref, url: 'http://localhost:99',
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

