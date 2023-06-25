import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { BookSchema } from "../db/schemas.ts";
import { Book } from "../types.ts";
import { booksCollection, editorialCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";

type GetBooksContext = RouterContext<"/books", Record<string | number, string | undefined>, Record<string, any>>;

type GetBookContext  = RouterContext<"/book/:id", {
    id: string;
} & Record<string | number, string | undefined>, Record<string, any>>

type GetBooksTContext  = RouterContext<"/books/:author", {
    author: string;
} & Record<string | number, string | undefined>, Record<string, any>>

type GetBooksDateContext = RouterContext<"/booksDate", Record<string | number, string | undefined>, Record<string, any>>



export const getBooks = async (context : GetBooksContext) => {
    const params = getQuery(context, { mergeParams: true });
    const books = await booksCollection.find({}).toArray()
    if(books.length === 0) { 
        context.response.body = []
    }

   const BOOKS = await Promise.all(books.map(async (book) => {

    const edi = await editorialCollection.findOne({_id : book.editorial})

    return {
        id : book._id,
        title : book.title,
        author : book.author,
        editorial : {
            id : edi?._id,
            name : edi?.name,
            year : edi?.year,
            books : (await booksCollection.find({editorial : edi?._id}).toArray()).map((b)=>({
                title : book.title,
                ayuda : "podria sacar mas cosas pero es inecesario no?"
            }))
        }
    }
   })
    ) 

    

    if(params.sort === "asc"){
        context.response.body = (await BOOKS).sort((a,b)=> a.title.localeCompare(b.title) )      
    }
    
    if(params.sort === "des"){
        context.response.body = (await BOOKS).sort((a,b)=> b.title.localeCompare(a.title) )      
    }
    
    context.response.body = BOOKS

}

export const getBook = async (context : GetBookContext) => {

    const id = context.params.id

    if(!id){
        context.response.status = 400
        return
    }
  
    const book = await booksCollection.findOne({_id : new ObjectId(id)})

    if(!book){
        context.response.status = 404
        return
    }

    
    const editorial = await editorialCollection.findOne({_id : book.editorial})


    if(!editorial){
        context.response.body = "fwafawfaw"
        return 
    }



    context.response.body = {
        id : book._id,
        title : book.title,
        author : book.author,
        editorial : {
            id : editorial._id,
            name : editorial.name,
            year: editorial.year,
            book : (await booksCollection.find({editorial : editorial?._id}).toArray()).map((book)=>({
                id : book._id,
                title : book.title,
                author : book.author,
                date : book.date,
            }))
        }
    }

}

export const getBooksT = async (context : GetBooksTContext) =>{
    const author = context.params.author

    if(!author){
        context.response.status = 500
        context.response.body = "mal"
        return
    }

    const books = await booksCollection.find({author : author}).toArray()

    if(books.length === 0 ){
        context.response.status = 500
        context.response.body = "mal"
        return
    }




      const BOOKS = await Promise.all(
        books.map(async (book) => ({
            id: book._id.toString(),
            title: book.title,
            author: book.author,
            editorial: await editorialCollection.findOne({_id: book.editorial })
        }))
      );

      context.response.body = BOOKS
}

export const getBooksDate = async (context : GetBooksDateContext) => {
    const params = getQuery(context, { mergeParams: true });
    const year = parseInt(params.year)
    const month = parseInt(params.month)-1

    if(!year || !month) {
        context.response.body ="faltan datos crakc"
        return
    }


    const books = await (await booksCollection.find({}).toArray()).filter((book)=> book.date.getFullYear() === year && book.date.getMonth() === month)

    console.log(books.length)
    if(books.length === 0){
        context.response.body ="no boobs? .. perdon books xD"
        return 
    }

    context.response.body = books
} 