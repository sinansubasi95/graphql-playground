const graphql = require('graphql');
const axios = require('axios');

const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
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

// -- Mutations --
// Mutations are used to change data in some fashion
// Mutations can be used in CRUD records

const mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addUser: {
            type: UserType,
            args: {
                firstName: { type: new GraphQLNonNull(GraphQLString) },
                age: { type: new graphql.GraphQLNonNull(GraphQLInt) },
                companyId: { type: GraphQLString }
            },
            resolve(parentValue, { firstName, age }) { // destructure args object
                return axios.post('http://localhost:3000/users', { firstName, age })
                    .then(res => res.data);
            }
        }
    }
});

/* GraphiQL
    mutation {
        addUser(firstName: "Stephen", age: 26) {
            // We must then ask for some properties coming back off from resolve function
            id,
            firstName,
            age
        }
    }
*/

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation // ES6 feature -> mutation: mutation
});