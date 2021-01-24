const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList
} = graphql;


const CompanyType = new GraphQLObjectType({
    name: 'Company',
    // -- Resolving Circular Reference --
    // This function gets defined but does not get executed until this entire file has been executed.
    fields: () => ({
        id: {
            type: GraphQLString
        },
        name: {
            type: GraphQLString
        },
        description: {
            type: GraphQLString
        },
        users: {
            // UserType is not defined yet so there will be circular reference issue.
            type: new GraphQLList(UserType), // multiple users associated with one company.
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.id}/users`)
                    .then(res => res.data);
            }
        }
    })
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        id: { 
            type: GraphQLString
        },
        firstName: {
            type: GraphQLString
        },
        age: {
            type: GraphQLInt
        },
        company: {
            type: CompanyType,
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${parentValue.companyId}`)
                    .then(res => res.data);
            }
        }
    }
});

// -- Query Fragments --
// List of different properties that we want to get access to.
// Purpose of Query Fragments is to avoid writing same fields over and over again.

/* GraphiQL ->
    {
        apple: company(id: "1") {
            ...companyDetails
        },
        google: company(id: "2") {
            ...companyDetails
        }
    }

    fragment companyDetails on Company {
        id,
        name,
        description
    }
*/

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        user: {
            type: UserType,
            args: { 
                id: {
                    type: GraphQLString
                },
            },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/users/${args.id}`)
                    .then(res => res.data); // { data: {firstName: 'bill'} }
            }
        },
        company: {
            type: CompanyType,
            args: {
                id: {
                    type: GraphQLString 
                }
            },
            resolve(parentValue, args) {
                return axios.get(`http://localhost:3000/companies/${args.id}`)
                    .then(res => res.data);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery
});