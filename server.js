import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import {GraphQLSchema, GraphQLObjectType, GraphQLList, GraphQLString, GraphQLInt, GraphQLNonNull} from 'graphql';

const authors = [
  {id: 1, name: "Ana"},
  {id: 2, name: "Bruno"}
]

const books = [
  {id: 1, name: "Folha", author_id: 1, date: "12/2/1945"},
  {id: 2, name: "Crepe", author_id: 1, date: "12/2/1945"},
  {id: 3, name: "Cavalo", author_id: 2, date: "12/2/1945"}
]

const app = express(); 

const RootQueryType = new GraphQLObjectType(
  {
    name:"Query",
    description:"Root Query",
    fields:()=>(
      {
        book:{
          type: BookType,
          description: "Find a book",
          args:{
            id: {type: GraphQLInt},
            name: {type: GraphQLString}
          },
          resolve: (parent, args)=> books.find( (element) => {
            if(element.id === args.id ){
              return element;
            }else if(element.name === args.name){
              return element;
            }
          } )
        },
        books:{
          type: new GraphQLList(BookType),
          description: "List of all books",
          resolve: () => books
        },
        authors:{
          type: new GraphQLList(AuthorType),
          description: "List of all authors",
          resolve: () => authors
        }
      }
    )
  }
  
)

const BookType = new GraphQLObjectType(
  {
    name:"Book",
    description:"Show Book",
    fields: ()=>(
      {
        id: {type: new GraphQLNonNull(GraphQLInt) },
        name: {type: new GraphQLNonNull(GraphQLString) },
        date: {type: new GraphQLNonNull(GraphQLString) },
        author_id: {type: new GraphQLNonNull(GraphQLInt) },
        author: {
          type: AuthorType,
          //the bellow its a bit tricky since it passes the current iterated object as "parent"
          resolve: (parent) => {
            return authors.find( element => element.id === parent.author_id )
          }
        }
      }
    )
  }
)

const AuthorType = new GraphQLObjectType(
  {
    name:"Author",
    description:"Name of the author",
    fields: ()=>(
      {
        id: {type: new GraphQLNonNull(GraphQLInt) },
        name: {type: new GraphQLNonNull(GraphQLString) },
        books: {
          type: GraphQLList(BookType),
          resolve: (parent) => {
            return books.filter( element => element.author_id === parent.id)
          }
        }
      }
    )
  }
)

const RootMutationType = new GraphQLObjectType(
  {
    name:"Mutation",
    description:"Root Mutation",
    fields: ()=>({
      addBook:{
        type: BookType,
        description: "Adds a book",
        args:{ author_id:{ type: GraphQLInt }, name:{ type: GraphQLString } },
        resolve: (parent, args) => {
          const book = {
            id: books.length+1, 
            name: args.name, 
            author_id: args.author_id
          }
          books.push(book)
          return book
        }
      },
      addAuthor:{
        type: AuthorType,
        description: "Adds a Author",
        args:{ name:{ type: GraphQLString } },
        resolve: (parent, args) => {
          const author = {
            id: authors.length+1, 
            name: args.name, 
          }
          authors.push(author)
          return author
        }
      }
    })
  }
)

const schema = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
})

app.use(
  '/graphql',
  graphqlHTTP(
    {
      schema: schema,
      graphiql: true
    }
  )
  )

app.listen(5000, ()=> console.log("hello from server") )