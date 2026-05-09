import z from "zod";
import { createPost } from "./post.validation";




export type createPostDTO = z.infer<typeof createPost.body>
    