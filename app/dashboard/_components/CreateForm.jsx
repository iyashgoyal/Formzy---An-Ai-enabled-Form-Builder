"use client"
import React, { useEffect, useRef, useState } from 'react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
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
    const [userInput,setUserInput]=useState('');
    const [loading,setLoading]=useState(false);
    const {user}=useUser();
    const route=useRouter();
    const requestRef=useRef(null);
    const cancelledRef=useRef(false);


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

    const closeDialog=()=>{
        cancelledRef.current=true;
        requestRef.current?.abort();
        setOpenDailog(false);
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

        cancelledRef.current=false;
        const controller=new AbortController();
        requestRef.current=controller;
        const timeoutId=setTimeout(()=>controller.abort(),75000);

        try
        {
            const response=await fetch('/api/generate-form',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({description:userInput.trim()}),
                signal:controller.signal
            });

            // Read the body as text first: when the deployment errors or times
            // out, the server returns an HTML/plain-text page. Calling
            // response.json() on that is what produced the confusing
            // "Unexpected token ... is not valid JSON" error.
            const rawBody=await response.text();
            let data=null;
            try
            {
                data=rawBody?JSON.parse(rawBody):null;
            }
            catch(parseError)
            {
                console.error('Non-JSON response from /api/generate-form:',response.status,rawBody.slice(0,500));
                throw new Error(
                    response.status===504||response.status===502
                        ?'The AI took too long to respond. Please try again.'
                        :`The server returned an unexpected response (${response.status}). Please try again.`
                );
            }

            if(!response.ok)
            {
                throw new Error(data?.error||'Could not generate the form.')
            }

            const generatedForm=data?.form;
            if(typeof generatedForm!=='string'||!generatedForm.trim())
            {
                throw new Error('The AI returned an empty response.')
            }

            try
            {
                JSON.parse(generatedForm);
            }
            catch(parseError)
            {
                console.error('Invalid form JSON from API:',parseError,generatedForm);
                throw new Error('The AI returned invalid form data. Please try again.');
            }

            const resp=await db.insert(JsonForms)
            .values({
                jsonform:generatedForm,
                style:'{}',
                theme:'light',
                createdBy:user?.primaryEmailAddress?.emailAddress,
                createdAt:moment().format('DD/MM/yyyy')
            }).returning({id:JsonForms.id});

            if(resp[0]?.id)
            {
                setUserInput('');
                setOpenDailog(false);
                route.push('/edit-form/'+resp[0].id)
            }
        }
        catch(error)
        {
            console.error('Form generation failed:',error);
            if(cancelledRef.current||requestRef.current!==controller)
            {
                return;
            }
            if(error.name==='AbortError')
            {
                toast.error('The AI is taking longer than usual. Please try again.');
            }
            else
            {
                toast.error(error.message||'Form generation failed. Check the browser console for details.');
            }
        }
        finally
        {
            clearTimeout(timeoutId);
            if(requestRef.current===controller)
            {
                requestRef.current=null;
                setLoading(false)
            }
        }
    }

    return (
        <div>
            <Button onClick={()=>setOpenDailog(true)}>+ Create Form</Button>
            <Dialog open={openDialog} onOpenChange={(open)=>{ if(!open) closeDialog() }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create new form</DialogTitle>
                        <DialogDescription className="sr-only">
                            Describe the form you want and our AI will build it for you.
                        </DialogDescription>
                    </DialogHeader>
                    {loading?
                        <div className="flex flex-col items-center justify-center gap-3 py-10 text-center">
                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                            <p className="text-sm font-medium text-foreground">Generating your form…</p>
                            <p className="max-w-xs text-xs text-muted-foreground">
                                Our AI is designing the fields for you. This usually takes a few seconds.
                            </p>
                            <Button className="mt-2" variant="outline" onClick={closeDialog}>
                                Cancel
                            </Button>
                        </div>
                        :
                        <>
                            <Textarea className="my-2"
                                value={userInput}
                                onChange={(event)=>setUserInput(event.target.value)}
                                placeholder="Write descrition of your form"/>
                            <div className='flex gap-2 my-3 justify-end'>
                                <Button
                                onClick={closeDialog}
                                variant="destructive">Cancel</Button>
                                <Button
                                onClick={()=>onCreateForm()}>
                                    Create
                                </Button>
                            </div>
                        </>
                    }
                </DialogContent>
            </Dialog>

        </div>
    )
}

export default CreateForm
