const webhandler = toWebHandler(useNitroApp().h3App)

Bun.serve({
  unix: '\0fn.socket',
  fetch: async (fnRequest: Request) => {
    if (
      fnRequest.method !== 'POST' ||
      new URL(fnRequest.url).pathname !== '/call'
    ) {
      return new Response(null, { status: 404 })
    }

    const appRequest = toAppRequest(fnRequest)
    const appResponse = await webhandler(appRequest)
    return toFnResponse(appResponse)
  },
})

console.log('listening on uds fn.socket..')

function toAppRequest(fnRequest: Request): Request {
  const fnRequestHeaders = fnRequest.headers

  const appRequest = new Request(
    new URL(fnRequestHeaders.get('Fn-Http-Request-Url'), fnRequest.url),
    {
      method: fnRequestHeaders.get('Fn-Http-Method'),
      body: fnRequest.body,
      headers: getAppRequestHeaders(fnRequest),
    },
  )
  return appRequest
}

function toFnResponse(appResponse: Response): Response {
  return new Response(appResponse.body, {
    status: 200,
    headers: getFnResponseHeaders(appResponse),
  })
}

function getAppRequestHeaders(fnRequest: Request): HeadersInit {
  return Object.fromEntries(
    fnRequest.headers
      .entries()
      .map(([key, value]) => {
        if (key.startsWith('Fn-Http-H-')) {
          return [key.substring('Fn-Http-H-'.length), value]
        }
        if (key === 'content-type') {
          return [key, value]
        }
        return undefined
      })
      .filter(Boolean),
  )
}

function getFnResponseHeaders(appResponse: Response): HeadersInit {
  return Object.fromEntries([
    ...appResponse.headers.entries().map(([key, value]) => {
      if (key === 'content-type') {
        return [key, value]
      }
      return [`Fn-Http-H-${key}`, value]
    }),
    ['Fn-Http-Status', appResponse.status],
    ['Fn-Fdk-Version', 'fdk-fetch/0.0.0'],
  ])
}
