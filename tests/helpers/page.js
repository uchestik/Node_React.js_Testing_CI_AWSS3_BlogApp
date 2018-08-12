const puppeteer = require('puppeteer');
const sessionFactory = require('../factories/sessionFactory');
const userFactory = require('../factories/userFactory');

class CustomPage {
    static async build(){
        const browser = await puppeteer.launch({
            headless : true,
            args : ['--no-sandbox'] //decreases time for test to run
        });

        const page = await browser.newPage();
        // const CustomPage = new CustomPage(page, browser);
        const customPage = new CustomPage(page);

        return new Proxy(customPage, {
            get : function(target, property){
                return customPage[property] || browser[property] || page[property];
            }
        })
    }

    constructor(page){
        this.page = page;
        // this.browser = browser
    }

    async login(){
        const user = await userFactory();
        const {session , sig} = sessionFactory(user);
        
        await this.page.setCookie({name : 'session', value : session});
        await this.page.setCookie({name : 'session.sig', value : sig});
        await this.page.goto('http://localhost:3000/blogs');
        await this.page.waitFor('a[href="/auth/logout"]');
    }

    async getContentsOf(selector){
        return this.page.$eval(selector, el => el.innerHTML);
    }

    get(path) {
        return this.page.evaluate(
            (_path) => {
                return fetch(_path, { //can not reference path in the closure scope because the evaluate function converts function to a string before sending off ot the browser
                    method : 'POST',
                    credentials : 'same-origin',
                    headers : {
                        'Content-Type' : 'application/json'   
                    },
                    body : JSON.stringify({title : 'My Title', content : 'My Content'})
                }).then(res => res.json());
            }, path // this is the closure scope variable path. it is passed into our evaluate function in the browser after its been converted back from a string
        );
    }

    post(path, data) {
        return this.page.evaluate(
            (_path, _data) => {
                return fetch(_path, {
                    method : 'POST',
                    credentials : 'same-origin',
                    headers : {
                        'Content-Type' : 'application/json'
                    },
                    body : JSON.stringify(_data)
                }).then(res => res.json())
            }, path, data
        )
    }

    // close(){
    //     this.browser.close();
    // }
}

module.exports = CustomPage;