"use client"
import React, { useEffect, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useUser } from '@clerk/nextjs'
import { db } from '@/configs'
import { JsonForms } from '@/configs/schema'
import moment from 'moment/moment'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { desc, eq } from 'drizzle-orm'

function CreateForm() {
    const [openDialog,setOpenDailog]=useState(false)
    const [userInput,setUserInput]=useState();
    const [loading,setLoading]=useState();
    const {user}=useUser();
    const route=useRouter();
 

    const [formList,setFormList]=useState();
  

    useEffect(()=>{
      
        user&&GetFormList()
    },[user])

    const GetFormList=async()=>{
        const result=await db.select().from(JsonForms)
        .where(eq(JsonForms.createdBy,user?.primaryEmailAddress?.emailAddress))
        .orderBy(desc(JsonForms.id));

        setFormList(result);
        
       
    }
    const onCreateForm=async()=>{
        if(formList?.length>=10)
        {
            toast('Upgrade to create unlimited forms')
            return;
        }
        if(!userInput?.trim())
        {
            toast.error('Describe the form you want to create.')
            return;
        }
        setLoading(true)
        try
        {
            const response=await fetch('/api/generate-form',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({description:userInput.trim()})
            });
            const data=await response.json();
            if(!response.ok)
            {
                throw new Error(data.error||'Could not generate the form.')
            }
            const generatedForm=data.form;
            if(!generatedForm)
            {
                throw new Error('Gemini returned an empty response.')
            }
            JSON.parse(generatedForm)

            const resp=await db.insert(JsonForms)
            .values({
                jsonform:generatedForm,
                createdBy:user?.primaryEmailAddress?.emailAddress,
                createdAt:moment().format('DD/MM/yyyy')
            }).returning({id:JsonForms.id});

            if(resp[0]?.id)
            {
                route.push('/edit-form/'+resp[0].id)
            }
        }
        catch(error)
        {
            console.error('Form generation failed:',error)
            toast.error(error.message||'Form generation failed. Check the browser console for details.')
        }
        finally
        {
            setLoading(false)
        }
    }
    return (
        <div>
            <Button onClick={()=>setOpenDailog(true)}>+ Create Form</Button>
            <Dialog open={openDialog}>
               
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create new form </DialogTitle>
                        <DialogDescription>
                        <Textarea className="my-2" 
                            onChange={(event)=>setUserInput(event.target.value)}
                        placeholder="Write descrition of your form"/>
                        <div className='flex gap-2 my-3 justify-end'>
                            <Button 
                            onClick={()=>setOpenDailog(false)}
                            variant="destructive">Cancel</Button>
                            <Button 
                                disabled={loading}
                            onClick={()=>onCreateForm()}>
                                {loading?
                                <Loader2 className='animate-spin' />:'Create'    
                            }
                                </Button>

                        </div>
                        </DialogDescription>
                    </DialogHeader>
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default CreateForm