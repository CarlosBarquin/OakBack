import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { BookSchema } from "../db/schemas.ts";
import { Book } from "../types.ts";
import { booksCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";

type PostBooksContext = RouterContext<"/books", Record<string | number, string | undefined>, Record<string, any>>;

export const postBooks = async (context : PostBooksContext)  => {
    const result = context.request.body({ type: "json" });
    const value = await  result.value 

    if (!value?.title || !value?.author) {
        context.response.status = 400;
       return
    }

    const book : BookSchema = {
        _id : new ObjectId(),
        title : value.title,
        author : value.author

    }

    await booksCollection.insertOne(book)

    context.response.body = {
        id: book._id.toString(),
        title: book.title,
        author: book.author,
      };




}