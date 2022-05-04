const url = 'http://192.168.0.16'

window.onload = async function () {
    const registerForm = document.querySelector('#register-form')
    const confirmForm = document.querySelector('#confirm-form')
    const passForm = document.querySelector('#password-form')
    const messageForm = document.querySelector('#message-form')

    const registerLoader = document.querySelector('#register-loader')
    const confirmLoader = document.querySelector('#confirm-loader')
    const passLoader = document.querySelector('#password-loader')
    const messageLoader = document.querySelector('#message-loader')

    const stopButton = document.querySelector('#stop-message')

    const deregisterBtn = document.querySelector('#deregister-button')

    const stats = document.querySelector('#stats')



    if (!localStorage.getItem('tims')) {
        localStorage.setItem('tims', JSON.stringify({
            form: {
                step: 'register'
            }
        }))
    }

    // FORM UI CONTROLLER
    formUiController()


    // FIRST STEP
    // TELEGRAM APP REGISTRATION
    registerForm.addEventListener('submit', async function (event) {
        const ld = JSON.parse(localStorage.getItem('tims'))
        cssClassChecker(registerLoader, ['show'], [true])
        cssClassChecker(registerForm, ['no-show'], [true])
        event.preventDefault()

        const go = await requestAPI(url + '/register', 'post', getFormDataAndReturnJSON(event.target))
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'confirm'
                },
                data: go.data
            }))
        }
        formUiController()

        cssClassChecker(registerLoader, ['show'], [false])
        cssClassChecker(registerForm, ['no-show'], [false])

    })


    // SECOND STEP 
    // CONFIRM
    confirmForm.addEventListener('submit', async function (event) {
        event.preventDefault()
        const ld = JSON.parse(localStorage.getItem('tims'))
        cssClassChecker(confirmLoader, ['show'], [true])
        cssClassChecker(confirmForm, ['no-show'], [true])

        const data = {
            ...ld.data,
            ...getFormDataAndReturnJSON(event.target)
        }

        const go = await requestAPI(url + '/confirm/code', 'post', data)
        console.log('go: ', go)
        if (go && !go.required) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'messaging'
                },
                data: go.data
            }))
        }
        else if (go && go.required) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'password'
                },
                data: go.data
            }))
        }
        formUiController()

        cssClassChecker(confirmLoader, ['show'], [false])
        cssClassChecker(confirmForm, ['no-show'], [false])
    })


    // PASSWORD
    passForm.addEventListener('submit', async function (event) {
        event.preventDefault()
        const ld = JSON.parse(localStorage.getItem('tims'))
        cssClassChecker(passLoader, ['show'], [true])
        cssClassChecker(passForm, ['no-show'], [true])

        const data = {
            ...ld.data,
            ...getFormDataAndReturnJSON(event.target)
        }

        const go = await requestAPI(url + '/confirm/password', 'post', data)
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'messaging'
                },
                data: go.data
            }))
        }
        formUiController()
        cssClassChecker(passLoader, ['show'], [false])
        cssClassChecker(passForm, ['no-show'], [false])
    })



    // MESSAGING
    messageForm.addEventListener('submit', async function (event) {
        const ld = JSON.parse(localStorage.getItem('tims'))
        event.preventDefault()

        const formData = getFormDataAndReturnJSON(event.target)
        const data = {
            ...formData,
            channels: formData.channels.split('--')
        }


        localStorage.setItem('tims', JSON.stringify({
            ...ld,
            form: {
                ...ld.form,
                step: 'working'
            }
        }))
        formUiController()


        const go = await requestAPI(url + '/message', 'post', data)
        console.log('go: ', go)
    })


    // DEREGISTER TELEGRAM APP
    deregisterBtn.addEventListener('click', async function () {
        const ld = JSON.parse(localStorage.getItem('tims'))
        console.log('ld: ', ld)
        const go = await requestAPI(url + '/deregister', 'post', {
            token: ld.data.token
        })
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'register'
                },
                data: {}
            }))
        }

        formUiController()
    })




    // GRAB STOP BUTTON
    stopButton.addEventListener('click', async function () {
        const ld = JSON.parse(localStorage.getItem('tims'))
        const go = await requestAPI(url + '/message/stop', 'post', { data: 'data' })
        console.log('go: ', go)
        if (go) {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'messaging'
                }
            }))
        }
        formUiController()
    })



    // GRAB RANGE SLIDER
    const slider = document.querySelector('#interval')
    const sliderDataField = document.querySelector('#interval-data')
    sliderDataField.innerHTML = slider.value
    slider.addEventListener('input', function (event) {
        sliderDataField.innerHTML = event.target.value
    })


    // WEBSOCKET
    socket.on('tims-request-send-message', async function (data) {
        stats.querySelector('#count').innerHTML = '...'
        const ld = JSON.parse(localStorage.getItem('tims'))
        if (ld.form.step != 'working') {
            localStorage.setItem('tims', JSON.stringify({
                ...ld,
                form: {
                    ...ld.form,
                    step: 'working'
                }
            }))
            formUiController()
        }
        console.log(data);
        stats.querySelector('#count').innerHTML = data.count
        stats.querySelector('#status').innerHTML = data.status
    })

}

async function requestAPI(url, method, data = {}, success = function () { }) {
    try {

        const req = await fetch(url, {
            body: JSON.stringify(data),
            headers: { 'Content-Type': 'application/json' },
            method: method
        })
        const response = await req.json()
        // console.log('response: ', response)

        if (!response.status) {
            throw response.message
        }
        success()
        return response


    } catch (error) {
        console.error(error)
        alert('ERROR ARISED:\n' + error)
        return false
    }
}


function formUiController() {
    let ld = JSON.parse(localStorage.getItem('tims'))

    const registerCont = document.querySelector('#register-container')
    const confirmCont = document.querySelector('#confirm-container')
    const messagingCont = document.querySelector('#messaging-container')
    const workingCont = document.querySelector('#working-container')
    const passCont = document.querySelector('#password-container')

    const deregisterBtn = document.querySelector('#deregister-button')

    const cssClasses = ['show', 'no-show']

    console.log(ld.form.step);
    switch (ld.form.step) {
        case 'register':
            cssClassChecker(registerCont, cssClasses, [true, false])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, true])
            cssClassChecker(passCont, cssClasses, [false, true])
            break
        case 'confirm':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [true, false])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, true])
            cssClassChecker(passCont, cssClasses, [false, true])
            break
        case 'password':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, true])
            cssClassChecker(passCont, cssClasses, [true, false])

            break
        case 'messaging':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [true, false])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [true, false])
            cssClassChecker(passCont, cssClasses, [false, true])
            break
        case 'working':
            cssClassChecker(registerCont, cssClasses, [false, true])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [true, false])
            cssClassChecker(deregisterBtn, cssClasses, [false, false])
            cssClassChecker(passCont, cssClasses, [false, true])
            break
        default:
            console.log('register-default-state');
            cssClassChecker(registerCont, cssClasses, [true, false])
            cssClassChecker(confirmCont, cssClasses, [false, true])
            cssClassChecker(messagingCont, cssClasses, [false, true])
            cssClassChecker(workingCont, cssClasses, [false, true])
            cssClassChecker(passCont, cssClasses, [false, true])
            cssClassChecker(deregisterBtn, cssClasses, [false, false])
            break
    }



}

function cssClassChecker(element, classes = [], desirable = []) {
    for (let i = 0; i < classes.length; i++) {
        if (element.classList.contains(classes[i]) && desirable[i] === false) {
            element.classList.remove(classes[i])
        } else if (!element.classList.contains(classes[i]) && desirable[i] === true) {
            element.classList.add(classes[i])
        }
    }
    // console.log(element.classList);

}


function getFormDataAndReturnJSON(target) {

    const formData = new FormData(target)
    let data = {}
    formData.forEach((value, key) => (data[key] = value))
    return data

}