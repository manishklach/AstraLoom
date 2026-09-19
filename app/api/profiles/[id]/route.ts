import {and,eq} from 'drizzle-orm';
import {getDb} from '../../../../db';
import {birthProfiles} from '../../../../db/schema';
import {getChatGPTUser} from '../../../chatgpt-auth';
export async function GET(_:Request,{params}:{params:Promise<{id:string}>}){const user=await getChatGPTUser();if(!user)return Response.json({error:'Sign in with ChatGPT to view profiles.'},{status:401});const id=Number((await params).id);if(!Number.isInteger(id))return Response.json({error:'Profile not found.'},{status:404});const [profile]=await getDb().select().from(birthProfiles).where(and(eq(birthProfiles.id,id),eq(birthProfiles.userId,user.userId))).limit(1);return profile?Response.json({profile}):Response.json({error:'Profile not found.'},{status:404});}
