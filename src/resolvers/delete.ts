import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { BookSchema } from "../db/schemas.ts";
import { Book } from "../types.ts";
import { booksCollection, editorialCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { BODY_TYPES } from "https://deno.land/x/oak@v11.1.0/util.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";


type deleteBookContext  = RouterContext<"/books/:id", {
    id: string;
} & Record<string | number, string | undefined>, Record<string, any>>


type deleteEditorialContext  = RouterContext<"/editorial/:id", {
    id: string;
} & Record<string | number, string | undefined>, Record<string, any>>


export const deleteBook = async (context : deleteBookContext) => {

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

    await booksCollection.deleteOne(book)

    context.response.body = book
}

export const deleteEditorial = async ( context : deleteEditorialContext) => {
    const id = context.params.id

    if(!id){
        context.response.status = 400
        return
    }
  
    const editoral = await editorialCollection.findOne({_id : new ObjectId(id)})

    if(!editoral){
        context.response.status = 404
        return
    }

    await editorialCollection.deleteOne(editoral)

    const books = await booksCollection.find({editorial : editoral._id}).toArray()

    if(books.length === 0){
        context.response.status = 400
        return
    }

    const BOOKS = books.map((book)=> ({
        id : book._id.toString(),
        title : book.title,
        author : book.author,
        editoral : editoral.name
    }))
    



    await booksCollection.delete({editorial : editoral._id})

    context.response.body = {
        id : editoral._id.toString(),
        name : editoral.name,
        year : editoral.year,
        books : BOOKS
    }
}