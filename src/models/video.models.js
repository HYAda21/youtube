import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const videoSchema = new Schema(
    {  
        videoFile:{
            type:String, //cloudinarty url
            required:true
        },
        thumbnail:
        {
           type:String ,//cloudinary url
           required:true
        },
        tittle:{
            type:String,
            required:true
        },
        duration:{
            type:Number,
            required:true
        },
        views:{
            type:Number,
            default:0
        },
        isPublished:{
            type:true,
            default:true
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User "
        }
},
{timestamps:true})
videoSchema.plugin(mongooseAggregatePaginate)

export const video = mongoose.models("video",videoSchema)