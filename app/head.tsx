export default function Head() {
  // Emit EXACT AdSense tag as requested to help with site verification.
  // Note: This renders in <head> for every page in App Router.
  return (
    <>
      <script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1427824399252755"
        crossOrigin="anonymous"
      />
    </>
  )
}
