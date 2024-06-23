const algoliasearch = require('algoliasearch');
const { handleError } = require('../api-util/sdk');

const client = algoliasearch(process.env.REACT_APP_ALGOLIA_APP_ID, process.env.REACT_APP_ALGOLIA_API_KEY);

const methods = {
    createData: (req, res) => {
        const {
            indexName = process.env.REACT_APP_ALGOLIA_LISTING_INDEX || 'Stoado-DEV',
            ...listing
        } = req.body;

        try {
            // create new index
            // indexName like a Cluster where we will store data.

            const index = client.initIndex(indexName);

            // objectID: "helosdgfyuewgtr78t2378g"
            return index.saveObjects([listing])
                .then(response => res
                    .status(200)
                    .set('Content-Type', 'application/transit+json')
                    .send({ data: response })
                    .end())
                .catch(e => {
                    console.error(e, '**** **** => e');
                    handleError(res, e);
                });

        } catch (error) {
            console.error(error, '**** **** => error');
            handleError(res, error);
        }
    },
    updateData: (req, res) => {
        const {
            indexName = process.env.REACT_APP_ALGOLIA_LISTING_INDEX || 'Stoado-DEV',
            ...listing
        } = req.body;

        try {
            // create new index
            // indexName like a Cluster where we will store data.

            const index = client.initIndex(indexName);

            return index.partialUpdateObjects([listing])
                .then(response => res
                    .status(200)
                    .set('Content-Type', 'application/transit+json')
                    .send({ data: response })
                    .end())
                .catch(e => {
                    console.error(e, '**** partialUpdateObjects **** => e');
                    handleError(res, e);
                });

        } catch (error) {
            console.error(error, '**** partialUpdateObjects **** => error');
            handleError(res, error);
        }
    },
    deleteData: (req, res) => {
        const {
             id,
            indexName = process.env.REACT_APP_ALGOLIA_LISTING_INDEX || 'Stoado-DEV',
        } = req.body;
        const param={
            objectID: id
        }
        try {
            // create new index
            // indexName like a Cluster where we will store data.

            const index = client.initIndex(indexName);

            return index.deleteObjects([id])
                .then(response => {
                    return res
                        .status(200)
                        .set('Content-Type', 'application/transit+json')
                        .send({ data: response
                            // [type]: data.map(d => ({
                            //     id: d.id,
                            //     parentId: d.attributes.parentId,
                            //     key: (d.attributes.name.charAt(0).toLowerCase() + d.attributes.name.slice(1)).replace(/ /g, "_").replace(/\//g, "_"),
                            //     value: d.attributes.name.charAt(0).toLowerCase() + d.attributes.name.slice(1),
                            //     label: d.attributes.name
                            // }))
                        })
                        .end();
                })
                .catch(e => {
                    console.error(e, '**** **** => e');
                    handleError(res, e);
                });

        } catch (error) {
            console.error(error, '**** **** => error');
            handleError(res, error);
        }
    },
    searchData: async (req, res) => {
        const {
            querySearch,
            filters = 'ListingType:VENDOR_PROFILE', // AND description:${querySearch}`
            indexName = process.env.REACT_APP_ALGOLIA_LISTING_INDEX || 'Stoado-DEV',
        } = req.body;

        try {
            // create new index
            // indexName like a Cluster where we will store data.

            const index = client.initIndex(indexName);
            return index.search(querySearch, { filters })
                .then(response => {
                    return res
                        .status(200)
                        .set('Content-Type', 'application/transit+json')
                        .send({ data: response })
                        .end();
                })
                .catch(e => {
                    console.error(e, '**** **** => e');
                    handleError(res, e);
                });

        } catch (error) {
            console.error(error, '**** **** => error');
            handleError(res, error);
        }
    }
};

module.exports = methods;