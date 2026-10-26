"use client"
import FormUi from '@/app/edit-form/_components/FormUi'
import { db } from '@/configs'
import { JsonForms } from '@/configs/schema'
import { SignIn, SignInButton } from '@clerk/nextjs'
import { eq } from 'drizzle-orm'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

function LiveAiForm({params}) {

    const [record,setRecord]=useState();
    const [jsonForm,setJsonForm]=useState([]);

    useEffect(()=>{
      
        params&&GetFormData()
    },[params])

    const GetFormData=async()=>{
        const result=await db.select().from(JsonForms)
        .where(eq(JsonForms.id,Number(params?.formid)))

        setRecord(result[0]);
        try {
            setJsonForm(result[0]?.jsonform ? JSON.parse(result[0].jsonform) : []);
        } catch (error) {
            console.error('Invalid saved form JSON:', error);
            setJsonForm([]);
        }
        try {
            setRecord(previous => ({ ...previous, parsedStyle: result[0]?.style ? JSON.parse(result[0].style) : {} }))
        } catch (error) {
            console.error('Invalid saved style JSON:', error);
            setRecord(previous => ({ ...previous, parsedStyle: {} }))
        }
        console.log(result);
    }
  return (
    <div className='p-10 flex justify-center items-center'
    style={{
        backgroundImage:record?.background
    }}
    >
    
       {record&& <FormUi
        jsonForm={jsonForm}
        onFieldUpdate={()=>console.log}
        deleteField={()=>console.log}
        selectedStyle={record?.parsedStyle || {}}
        selectedTheme={record?.theme || 'light'}
        editable={false}
        formId={record.id}
        enabledSignIn={record?.enabledSignIn}
        />}
        <Link className='flex gap-2 items-center
         bg-black text-white px-3 py-1 rounded-full
         fixed bottom-5 left-5 cursor-pointer 
         '
            href={'/'}
         >
            <Image src={'/logo.png'} width={26} height={26} />
            Build your Own AI form
        </Link>
    </div>
  )
}

export default LiveAiForm