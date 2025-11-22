export default function Home() {
  return (
    <div className="flex items-center justify-center bg-zinc-50 font-sans dark:bg-black" style={{flexGrow: 1}}>
      <main className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <p>splash page of some sort, describing what this server is, possibly some crude information about the owner of the server and emergency contact info for a backup user in case access is needed and the owner is not available for any reason, this second account holder should of course be someone trusted to provide a full list of all possessions to</p>
        <p>If it wasn&apos;t obvious, there is no actual login currently, Just clicking the login button currently fakes you being a recognized user allowing me to test certain behavior of showing/hiding certain data and maybe more in the future? at least until there are actual accounts to be logged into</p>
      </main>
    </div>
  );
}
