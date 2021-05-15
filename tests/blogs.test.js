const Page = require("./helpers/page");

let page;

beforeEach(async () => {
    page = await Page.build();
    page.goto("localhost:3000");
});

afterEach(async () => {
    await page.close();
});

describe("When logged in", async () => {
    beforeEach(async () => {
        await page.login();
        await page.click("a.btn-floating");
    });

    test("can see blog creation form", async () => {
        const label = await page.getContentsOf("form label");

        expect(label).toEqual("Blog Title");
    });

    describe("And using valid inputs", async () => {
        beforeEach(async () => {
            await page.type(".title input", "My Title");
            await page.type(".content input", "My Content");

            await page.click("form button");
        });

        test("Submitting takes user to review screen", async () => {
            const text = await page.getContentsOf("h5");
            expect(text).toEqual("Please confirm your entries");
        });

        test("Submitting then saving adds blog to index page", async () => {
            await page.click("button.green");
            await page.waitFor(".card");
            const text = await page.getContentsOf(".card-title");
            const content = await page.getContentsOf("p");

            expect(text).toEqual("My Title");
            expect(content).toEqual("My Content");
        });
    });

    describe("And using invalid inputs", async () => {
        beforeEach(async () => {
            await page.click("form button");
        });
        test("the form shows an error", async () => {
            const titleError = await page.getContentsOf(".title .red-text");
            const contentError = await page.getContentsOf(".content .red-text");

            expect(titleError).toEqual("You must provide a value");
            expect(contentError).toEqual("You must provide a value");
        });
    });
});

describe("When user is not logged in", async () => {
    test("User cannot create blog posts", async () => {
        await page.waitForNavigation();
        const result = await page.evaluate(async () => {
            const response = await fetch("/api/blogs", {
                method: "POST",
                credentials: "same-origin",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify({
                    title: "My Title",
                    content: "My Content"
                })
            });

            return response.json();
        });

        expect(result).toEqual({ error: "You must log in!" });
    });

    test("User cannot retrieve blog posts", async () => {
        await page.waitForNavigation();
        const result = await page.evaluate(async () => {
            const response = await fetch("/api/blogs", {
                method: "GET",
                credentials: "same-origin",
                headers: {
                    "content-type": "application/json"
                }
            });

            return response.json();
        });

        expect(result).toEqual({ error: "You must log in!" });
    });
});
