// import {clerkClient} from '@clerk/express';

// export const protectAdmin = async(req,res,next) => {
//     try {
//         const {userId} = req.auth();
//         const user = await clerkClient.users.getUser(userId)

//         if(user.privateMetadata.role !== 'admin'){
//             return res.json({success:false,message:'not authorized'})
//         }

//         next();
        
//     } catch (error) {
//          return res.json({success:false,message:'not authorized'})
//     }
// }

// export const protectAdmin = async (req, res, next) => {
//     try {
//         const { userId } = req.auth();

//         console.log("USER ID:", userId);

//         const user = await clerkClient.users.getUser(userId);

//         console.log("PRIVATE METADATA:", user.privateMetadata);

//         if (user.privateMetadata.role !== 'admin') {
//             return res.json({
//                 success: false,
//                 message: 'not authorized'
//             });
//         }

//         next();

//     } catch (error) {
//         console.error("AUTH ERROR:", error);

//         return res.json({
//             success: false,
//             message: 'not authorized'
//         });
//     }
// };
import { clerkClient, getAuth } from '@clerk/express';

export const protectAdmin = async (req, res, next) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.json({
                success: false,
                message: 'User not authenticated'
            });
        }

        const user = await clerkClient.users.getUser(userId);

        console.log('PRIVATE METADATA:', user.privateMetadata);

        if (user.privateMetadata.role !== 'admin') {
            return res.json({
                success: false,
                message: 'not authorized'
            });
        }

        next();

    } catch (error) {
        console.error('AUTH ERROR:', error);

        return res.json({
            success: false,
            message: error.message
        });
    }
};