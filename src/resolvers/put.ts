import { RouterContext } from "https://deno.land/x/oak@v11.1.0/router.ts";
import { BookSchema } from "../db/schemas.ts";
import { Book } from "../types.ts";
import { booksCollection } from "../db/mongo.ts";
import { ObjectId } from "https://deno.land/x/web_bson@v0.2.5/src/objectid.ts";
import { BODY_TYPES } from "https://deno.land/x/oak@v11.1.0/util.ts";
import { Context } from "https://deno.land/x/oak@v11.1.0/mod.ts";


type putBookContext  = RouterContext<"/books/:id", {
    id: string;
} & Record<string | number, string | undefined>, Record<string, any>>

export const updateBook = async ( context : putBookContext) =>{
    const id = context.params.id

    if(!id){
        context.response.status = 400
        return
    }

    const result = context.request.body({ type: "json" });
    const value = await result.value;

    if (!value?.title && !value?.author) {
      context.response.status = 400;
      return;
    }

    const book = await booksCollection.findOne({_id : new ObjectId(id)})

    if(!book){
        context.response.status = 500
        return
    }

    await booksCollection.updateOne({_id : new ObjectId(id)}, {$set : {
        title : value.title,
        author : value.author
    }})

    context.response.body = {
        id : book._id.toString(),
        title: value.title,
        author : value.author
    }

  
}