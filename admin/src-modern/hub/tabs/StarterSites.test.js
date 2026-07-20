import { importStarter } from './StarterSites';

describe( 'Starter Sites — granular full-site import', () => {
	afterEach( () => {
		delete window.fetch;
		delete window.pixassist;
	} );

	test( 'should exclude unavailable commerce content from full-site requests', async () => {
		const manifest = {
			taxonomies: [
				{ name: 'category', ids: { 1: 1 }, priority: 10 },
				{ name: 'product_cat', ids: { 2: 2 }, priority: 20 },
			],
			post_types: [
				{ name: 'page', ids: { 3: 3 }, priority: 10 },
				{ name: 'product', ids: { 4: 4 }, priority: 20 },
			],
			post_settings: {
				options: {
					blogname: 'Julia',
					woocommerce_permalinks: { product_base: '/product' },
				},
			},
		};
		window.pixassist = { wpRest: {} };
		window.fetch = jest.fn().mockImplementation( async ( url ) => {
			if ( String( url ).includes( '/data' ) ) {
				return {
					ok: true,
					json: async () => ( { code: 'success', message: '', data: manifest } ),
				};
			}

			return {
				ok: true,
				json: async () => ( { code: 'success', message: '', data: {} } ),
			};
		} );
		const starter = {
			id: 'julia-lt',
			baseRestUrl: 'https://starter.example.test/julia-lt/wp-json/sce/v2/',
			segments: [ { id: 'commerce', available: false } ],
		};
		const data = {
			endpoints: {
				import: {
					method: 'POST',
					url: 'https://local.example.test/wp-json/pixassist/v1/import',
				},
			},
		};
		const setProgress = jest.fn();

		await importStarter( starter, data, { importing: 'Preparing starter.' }, setProgress );

		const requests = window.fetch.mock.calls
			.filter( ( [ url ] ) => String( url ).includes( '/pixassist/v1/import' ) )
			.map( ( [ , options ] ) => JSON.parse( options.body ) )
			.map( ( request ) => ( {
				type: request.type,
				name: request.args.tax || request.args.post_type || '',
				data: request.args.data || null,
			} ) );

		expect( requests ).toEqual( [
			{ type: 'taxonomy', name: 'category', data: null },
			{ type: 'post_type', name: 'page', data: null },
			{
				type: 'post_settings',
				name: '',
				data: { options: { blogname: 'Julia' } },
			},
		] );

		const manifestProgress = setProgress.mock.calls.find( ( [ update ] ) => update && Number.isFinite( update.total ) );
		expect( manifestProgress[ 0 ] ).toMatchObject( {
			total: 5,
			phaseTotals: {
				prepare: 1,
				media: 0,
				content: 2,
				design: 0,
				finish: 2,
			},
		} );
	} );

	test( 'should continue when an optional source taxonomy is unavailable', async () => {
		const requestedSteps = [];
		window.pixassist = { wpRest: {} };
		window.fetch = jest.fn().mockImplementation( async ( url, options = {} ) => {
			if ( String( url ).includes( '/data' ) ) {
				return {
					ok: true,
					json: async () => ( {
						code: 'success',
						message: '',
						data: {
							taxonomies: [ { name: 'wprm_course', ids: { 1: 1 } } ],
							post_types: [ { name: 'page', ids: { 2: 2 } } ],
						},
					} ),
				};
			}

			const request = JSON.parse( options.body );
			requestedSteps.push( request.args.tax || request.args.post_type );

			if ( 'wprm_course' === request.args.tax ) {
				return {
					ok: true,
					json: async () => ( { code: 'missing_tax', message: 'Taxonomy unavailable.', data: {} } ),
				};
			}

			return {
				ok: true,
				json: async () => ( { code: 'success', message: '', data: {} } ),
			};
		} );
		const starter = {
			id: 'julia-lt',
			baseRestUrl: 'https://starter.example.test/julia-lt/wp-json/sce/v2/',
			segments: [],
		};
		const data = {
			endpoints: {
				import: {
					method: 'POST',
					url: 'https://local.example.test/wp-json/pixassist/v1/import',
				},
			},
		};

		await importStarter( starter, data, { importing: 'Preparing starter.' }, jest.fn() );

		expect( requestedSteps ).toEqual( [ 'wprm_course', 'page' ] );
	} );

	test( 'should upload placeholders and ignored media with their source groups', async () => {
		const uploads = [];
		const manifest = {
			media: {
				placeholders: [ 175, 176 ],
				ignored: [ 9 ],
				source_urls: {
					175: 'https://starter.example.test/placeholder-175.jpg',
					176: 'https://starter.example.test/placeholder-176.jpg',
					9: 'https://starter.example.test/logo.svg',
				},
				metadata: [ 999 ],
			},
		};
		window.pixassist = { wpRest: {} };
		window.fetch = jest.fn().mockImplementation( async ( url, options = {} ) => {
			if ( String( url ).includes( '/data' ) ) {
				return {
					ok: true,
					json: async () => ( { code: 'success', message: '', data: manifest } ),
				};
			}

			if ( String( url ).includes( '/media?id=' ) ) {
				const remoteId = new URL( String( url ) ).searchParams.get( 'id' );
				const sourceUrl = 'https://starter.example.test/uploads/attachment-' + remoteId + '.jpg';
				return {
					ok: true,
					json: async () => ( {
						code: 'success',
						data: {
							media: {
								title: 'attachment-' + remoteId,
								ext: 'jpg',
								data: 'data:image/jpeg;base64,aW1hZ2U=',
								urls: { full: sourceUrl },
							},
						},
					} ),
				};
			}

			const request = JSON.parse( options.body );
			uploads.push( {
				remoteId: request.remote_id,
				group: request.group,
				sourceUrls: request.source_urls,
			} );

			return {
				ok: true,
				json: async () => ( { code: 'success', message: '', data: {} } ),
			};
		} );
		const starter = {
			id: 'pile-lt-media-contract',
			baseRestUrl: 'https://starter.example.test/pile-lt/wp-json/sce/v2/',
			segments: [],
		};
		const data = {
			endpoints: {
				uploadMedia: {
					method: 'POST',
					url: 'https://local.example.test/wp-json/pixassist/v1/upload-media',
				},
			},
		};
		const setProgress = jest.fn();

		await importStarter( starter, data, { importing: 'Preparing starter.' }, setProgress );

		expect( uploads ).toEqual( [
			{ remoteId: 175, group: 'placeholders', sourceUrls: { full: 'https://starter.example.test/uploads/attachment-175.jpg' } },
			{ remoteId: 176, group: 'placeholders', sourceUrls: { full: 'https://starter.example.test/uploads/attachment-176.jpg' } },
			{ remoteId: 9, group: 'ignored', sourceUrls: { full: 'https://starter.example.test/uploads/attachment-9.jpg' } },
		] );
		const manifestProgress = setProgress.mock.calls.find( ( [ update ] ) => update && Number.isFinite( update.total ) );
		expect( manifestProgress[ 0 ] ).toMatchObject( {
			total: 7,
			phaseTotals: {
				prepare: 1,
				media: 6,
			},
		} );
	} );
} );
