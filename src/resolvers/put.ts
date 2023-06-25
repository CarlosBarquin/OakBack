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


type askBookContext  = RouterContext<"/askBook", Record<string | number, string | undefined>, Record<string, any>>

type releaseBookContext  = RouterContext<"/releaseBook/:id", {
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

export const askBook = async ( context : askBookContext) => {
    try {

        const found = await booksCollection.findOne({reservado : false})

        if(!found){
            context.response.body = "no hay coches libres"
            context.response.status = 404
        }

        await booksCollection.updateOne({_id : found?._id},{$set : {
            reservado : true
        }})

        context.response.body = found?._id
        
    } catch (e) {
        context.response.body = e
    }
}

export const releaseBook = async (context : releaseBookContext) => {
    try {
        const id = context.params.id
        const book = await booksCollection.findOne({_id : new ObjectId(id)})
        if(!book){
            context.response.status = 404
        }

        if(book?.reservado === false) {
            context.response.status = 400
        }
        
        await booksCollection.updateOne({_id : book?._id},{$set : {
            reservado : false
        }})

        context.response.status = 200

    } catch (error) {
        context.response.body = error
    }
}