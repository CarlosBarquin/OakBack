import { ObjectId } from "https://deno.land/x/mongo@v0.31.1/mod.ts";
import { Book, Editorial } from "../types.ts";

export type BookSchema = Omit<Book, "id" | "editorial"> & { _id: ObjectId, editorial : ObjectId };

export type EditorialSchema = Omit<Editorial, "id" | "books"> & { _id: ObjectId };
