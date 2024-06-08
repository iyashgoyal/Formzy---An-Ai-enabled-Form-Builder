"use client";
import { Button } from "@/components/ui/button";
import { SignInButton, UserButton, useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React, { useEffect } from "react";

function Header() {
  const { user, isSignedIn } = useUser();
  const path = usePathname();
  useEffect(() => {
    console.log(path);
  }, []);
  return (
    !path.includes("aiform") && (
      <div className="p-3 px-5 border-b shadow-sm">
        <div className="flex items-center justify-between">
          <a className="flex flex-row gap-4" href="/">
            <Image src={"/logo.svg"} width={40} height={40} alt="logo" />{" "}
            <div className=" font-bold font-mono text-3xl text-violet-800 ">Formzy</div>{" "}
          </a>
          {isSignedIn ? (
            <div className="flex items-center gap-5">
              <Link href={"/dashboard"}>
                <Button variant="outline">Dashboard</Button>
              </Link>
              <UserButton />
            </div>
          ) : (
            <SignInButton>
              <Button>Get Started</Button>
            </SignInButton>
          )}
        </div>
      </div>
    )
  );
}

export default Header;
