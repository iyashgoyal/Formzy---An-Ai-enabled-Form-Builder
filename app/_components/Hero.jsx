import { AtomIcon, Edit, Share2 } from "lucide-react";
import React from "react";

function Hero() {
  return (
    // bg-[url('/grid.svg')]
    <section className=" h-full bg-[url('/grid.svg')]">
      <div className="mx-auto max-w-screen-xl z-30 px-4 pt-32 lg:flex  ">
        <div className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl font-extrabold sm:text-5xl">
            Create Forms
            <strong className="font-extrabold text-primary sm:block">
              {" "}
              With the help of AI{" "}
            </strong>
          </h1>

          <p className="mt-4 sm:text-xl/relaxed text-gray-500">
            Generate, publish and share your form right away with AI.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              className="block w-full rounded bg-primary px-12 py-3 text-sm font-medium text-white shadow hover:bg-purple-600 focus:outline-none focus:ring active:bg-red-500 sm:w-auto"
              href="dashboard"
            >
              + Create AI Form
            </a>

            <a
              className="block w-full rounded px-12 py-3 text-sm font-medium text-primary shadow hover:text-purple-600 focus:outline-none focus:ring active:text-red-500 sm:w-auto"
              href="#"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>
      {/* <img src='/grid.svg' className=' absolute w-full h-[400px] '/> */}
      <section className="">
        <div className="mx-auto max-w-screen-xl px-4 py-56 pb-20 ">
          <div className="mx-auto max-w-lg text-center">
            <h2 className="text-3xl font-bold text-primary sm:text-4xl">How it Works</h2>

            <p className="mt-4 text-gray-700">
            Formzy streamlines form creation with ease. Simply input your prompt, and our advanced AI, powered by Google Gemini, generates relevant questions and options.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <a
              className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
              href="#"
            >
              <AtomIcon className="h-8 w-8" />

              <h2 className="mt-4 text-xl font-bold text-pink-600">
                Write promot for your form
              </h2>

              <p className="mt-1 text-sm text-gray-600">
              Enter your prompt, and our advanced AI, powered by Google Gemini, will generate relevant questions and options tailored to your needs, ensuring a seamless start to your form creation process
              </p>
            </a>

            <a
              className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
              href="#"
            >
              <Edit className="h-8 w-8" />

              <h2 className="mt-4 text-xl font-bold text-pink-600">
                Edit Your form{" "}
              </h2>

              <p className="mt-1 text-sm text-gray-600">
              Customize your form effortlessly. Adjust questions and options to perfectly fit your requirements, ensuring the form meets your specific needs and preferences with an easy-to-use editing interface
              </p>
            </a>

            <a
              className="block rounded-xl border border-gray-800 p-8 shadow-xl transition hover:border-pink-500/10 hover:shadow-pink-500/10"
              href="#"
            >
              <Share2 className="h-8 w-8" />

              <h2 className="mt-4 text-xl font-bold text-pink-600">
                Start Accepting Responses
              </h2>

              <p className="mt-1 text-sm text-gray-600">
              Launch your form and begin collecting responses with ease. Manage, review, and analyze submissions through our intuitive platform, making it simple to gather and interpret your data effectively
              </p>
            </a>
          </div>

          <div className="mt-12 text-center">
            <a
              href="/sign-in"
              className="inline-block rounded bg-pink-600 px-12 py-3 text-sm font-medium text-white transition hover:bg-pink-700 focus:outline-none focus:ring focus:ring-yellow-400"
            >
              Get Started Today
            </a>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Hero;
