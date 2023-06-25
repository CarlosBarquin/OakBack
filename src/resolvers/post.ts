import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { BookSchema, EditorialSchema } from "../db/schemas.ts";
import { Book, Editorial } from "../types.ts";
import { booksCollection, editorialCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { getQuery } from "https://deno.land/x/oak@v11.1.0/helpers.ts";
import { H } from "https://deno.land/x/mongo@v0.31.1/src/auth/scram.ts";


type PostBooksContext = RouterContext<"/books", Record<string | number, string | undefined>, Record<string, any>>;

type PostEditoContext = RouterContext<"/editorial", Record<string | number, string | undefined>, Record<string, any>>;


export const postBooks = async (context : PostBooksContext)  => {
    const result = context.request.body({ type: "json" });
    const value = await  result.value 

    if (!value?.title || !value?.author || !value?.editorial || !value?.year || !value?.month || !value?.day) {
        context.response.status = 400;
       return
    }

    const ed = await editorialCollection.findOne({name : value.editorial})

    const date = new Date(value.year,value.month,value.day)

    if(!ed){
        context.response.status = 400;
        return
    }

    const book : BookSchema = {
        _id : new ObjectId(),
        title : value.title,
        author : value.author,
        editorial : ed._id,
        date : date
    }

    await booksCollection.insertOne(book)

    context.response.body = {
        id: book._id.toString(),
        title: book.title,
        author: book.author,
        editorial : book.editorial,
        date : {
            year : value.year,
            month : value.month,
            day : value.day
        }
      };




}


export const postEditorial = async ( context : PostEditoContext) => {
    const result = context.request.body({ type: "json" });
    const value = await  result.value 

    if (!value?.name || !value?.year) {
        context.response.status = 400;
       return
    }

    const editoral : EditorialSchema = {
        _id : new ObjectId(),
        name : value.name,
        year : value.year
    }

    await editorialCollection.insertOne(editoral)

    context.response.body = {
        id : editoral._id.toString(),
        name : editoral.name,
        year: editoral.year,
        books : []
    }

}
