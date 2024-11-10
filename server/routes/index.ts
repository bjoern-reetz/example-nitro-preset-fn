export default defineEventHandler((_event) => {
  return `
<h1>Welcome home</h1>
<ul>
	<li><a href="/">Home</a></li>
	<li><a href="/other">Other</a></li>
</ul>`
})
