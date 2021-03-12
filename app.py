from typing import Callable

from uvicorn import run
from os import path
from sys import argv
from starlette.applications import Starlette
from starlette.routing import Route, Mount
from starlette.templating import Jinja2Templates
from starlette.requests import Request
from starlette.responses import Response, RedirectResponse, PlainTextResponse
from starlette.staticfiles import StaticFiles

templates = Jinja2Templates(directory=path.join(path.dirname(__file__), "templates"))
templates.env.add_extension("jinja2_highlight.HighlightExtension")
templates.env.add_extension("jinja_markdown.MarkdownExtension")
templates.env.extend(jinja2_highlight_cssclass="highlight")


def simple(name: str) -> Callable[[Request], Response]:
    return lambda request: templates.TemplateResponse(f"{name}.jinja2", {"request": request})


def advanced(resource_name: str) -> Callable[[Request], Response]:
    def _internal(request: Request) -> Response:
        page_name = request.path_params["name"]
        if path.exists(path.join(path.dirname(__file__), "templates", resource_name, page_name + ".jinja2")):
            return templates.TemplateResponse(f"{resource_name}/{page_name}.jinja2", {"request": request})
        else:
            return RedirectResponse(f"/{resource_name}")
    return _internal


app = Starlette(routes=[
    Route("/", endpoint=simple("home")),
    Route("/publications", endpoint=simple("publications")),
    Route("/about", endpoint=simple("about")),
    Route("/publications/{name:str}", endpoint=advanced("publications")),
    Route("/writeups", endpoint=simple("writeups")),
    #  Route("/writeups/{name:str}", endpoint=advanced("writeups")),

    # redirects outside
    Route("/asktoask", lambda _: RedirectResponse("https://www.youtube.com/watch?v=53zkBvL4ZB4")),

    # trolls
    Route("/teapot", lambda _: PlainTextResponse("I'm a teapot", status_code=418)),
    Route("/admin.php", lambda _: RedirectResponse("https://www.youtube.com/watch?v=dQw4w9WgXcQ")),

    # static files
    Mount("/", app=StaticFiles(directory=path.join(path.dirname(__file__), "static")))
])

if __name__ == "__main__":
    if len(argv) == 2:
        run(app, host="0.0.0.0", port=int(argv[1]))
    else:
        run("app:app", debug=True, reload=True)
