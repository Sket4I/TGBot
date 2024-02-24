import TelegramBot from 'node-telegram-bot-api'
import fetch from 'node-fetch'
import { pipeline } from 'stream'
import { promisify } from 'util'
import fs from 'fs'
import 'dotenv/config'
import path from 'path'
import { fileURLToPath } from 'url'
import { transcriptVoice } from './transcript.js'
import { dbQuery } from './db.js'
import dateformat from 'dateformat'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const tmpDir = path.resolve(__dirname, 'tmp' + Date.now())

let isVoiceEnable = false
process.env.NTBA_FIX_350 = true

const download = async ({ url, path }) => {
    const streamPipeline = promisify(pipeline)

    const response = await fetch(url)

    if (!response.ok) {
        throw new Error(`unexpected response ${response.statusText}`)
    }

    await streamPipeline(response.body, fs.createWriteStream(path))
}

const bot = new TelegramBot(process.env.API_KEY_BOT, {
    polling: true
})

bot.on('text', async msg => {
    try {
        if (msg.text === '/start') {
            isVoiceEnable = false
            const buffer = fs.readFileSync('./img/hello.jpg')
            await bot.sendPhoto(msg.chat.id, buffer, {
                caption:`Привет, я ваш персональный чат-бот крупнейшего сообщества доноров крови в России — DonorSearch.
                
Узнай, как твой питомец может стать настоящим героем и спасти жизни!

Получите подробную информацию о процессе донорства у живтоных и необходимых шагах в разделе "Информация о донорстве".
Найдите подходящего донора для вашего любимца в разделе "Найти донора". "Стать донором" - это шанс сделать доброе дело, ваш питомец может стать настоящим героем, спасая чью-то жизнь. Получите поддержку и консультации по всем вопросам донорства в разделе "Связь с оператором".

Давайте вместе делать добрые дела и менять мир к лучшему!Ваш вклад может стать ключом к выздоровлению и благополучию других питомцев.❤️`,
                reply_markup: {
                    keyboard: [
                        ['О донорстве'],
                        ['Найти донора', 'Стать донором'],
                        ['Закрыть меню']
                    ],
                    resize_keyboard: true
                }
            })
        } else if (msg.text === '/menu') {
            isVoiceEnable = false
            await bot.sendMessage(msg.chat.id, 'Меню', {
                reply_markup: {
                    keyboard: [
                        ['О донорстве'],
                        ['Найти донора', 'Стать донором'],
                        ['Закрыть меню']
                    ],
                    resize_keyboard: true
                }
            })
        } else if (msg.text === 'Закрыть меню') {
            isVoiceEnable = false
            await bot.sendMessage(msg.chat.id, 'Меню закрыто', {
                reply_markup: {
                    remove_keyboard: true
                }
            })
        } else if (msg.text === 'Стать донором') {
            isVoiceEnable = false
            const buffer = fs.readFileSync('./img/beDonor.jpg')
            await bot.sendPhoto(msg.chat.id, buffer, {
                caption:`Для того, чтобы стать донором необходимо зарегистрироваться. 
Ресурсов данного бота на это не хвататет, поэтому ждем вас на сайте:

http://31.129.45.230

Ваш DonorSearch`
            })
        } else if (msg.text === 'Найти донора') {
            isVoiceEnable = false
            const buffer = fs.readFileSync('./img/findDonor.jpg')
            await bot.sendPhoto(msg.chat.id, buffer, {
                caption:`Здесь вы можете запросить помощь в поиске подходящего донора для вашего питомца. 
                
Информацию можно заполнить с помощью текста либо с помощью голосового сообщения`
            })
            await bot.sendMessage(msg.chat.id,
                `Данные питомца:
Что за питомец
Имя питомца
Причина поисков
Количество мл крови
Количество доноров
Группу крови питомца
Дата окончания поиска донора (день, месяц, год и, если понадобится, время)
Ветклинику, куда привезти донора

Данные хозяина:
ФИО
Телефон
Город

Выберите варианты ввода:`, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Текстом', callback_data: 'text' }],
                        [{ text: 'Голосовым сообщением', callback_data: 'voice' }],
                        [{ text: 'Отменить запрос', callback_data: 'exit' }]
                    ]
                }
            })
        } else if (msg.text === 'О донорстве') {
            isVoiceEnable = false
            const buffer = fs.readFileSync('./img/info.jpg')
            await bot.sendPhoto(msg.chat.id, buffer, {
                caption:`“Информация о донации”
                
Донорство крови для питомцев - важное дело, так как многие из них могут нуждаться в переливании из-за травм или болезней. Быть донором это не только спасать жизнь других, но и поддерживать здоровье собственного питомца. Регулярное обследование крови вашего питомца помогает выявить проблемы вовремя.`
            })

            await bot.sendMessage(msg.chat.id,
                `<b>Показания для донорства</b>

<i>Требования к собаке-донору:</i>
Возраст от 1 года до 7 лет
Вес от 20 кг
Своевременно вакцинированные и обработанные от паразитов (не более 3 месяцев назад)
Клинически здорова (без внешних проявлений болезни)
Нормальные анализы крови.
Собака должна быть обработана от эктопаразитов

<i>Требования к кошке-донору:</i>
Возраст от 1 года до 7 лет
Вес от 3кг
Своевременно вакцинированные и обработанные от паразитов (не более 6 месяцев назад)
Клинически здорова (без внешних проявлений болезни)
Нормальные анализы крови.
Желательно, чтобы кошка не была агрессивной.

<b>Противопоказания для донорства</b>

Беременным и кормящим сукам
Животным, которым ранее проводилось переливание донорской крови
Нельзя сдавать кровь за 4 недели до и 3 недели после вакцинации.
Нельзя сдавать кровь во время эструса (течки), беременности, кормления.

<b>Подготовка к донации</b>

Перед донацией требуется специальная подготовка – это голодная диета в течение 6-10 часов, т.к. у животного берутся клинический и биохимический анализы крови.

<b>Процесс донорства</b>

Делается краткое медицинское обследование для определения пригодности к донорству, а после роводится процедура забора крови, которая занимает несколько минут

<b>Безопасность донорства</b>

У здорового животного объем сданной крови выполняется за 3-4 недели, т.е. полностью восстанавливаются все показатели крови. Кровь питомца берется без наркоза т.к. это абсолютно безболезненная процедура.`,
{
    parse_mode: "HTML"
})
        } else if (msg.text.startsWith('Отредактировано') || msg.text.startsWith('отредактировано')) {
            isVoiceEnable = false
            const promt = {
                "modelUri": "gpt://" + process.env.YANDEX_DIRECTORY_ID + "/yandexgpt",
                "completionOptions": {
                    "stream": false,
                    "temperature": 0.6,
                    "maxTokens": "2000"
                },
                "messages": [
                    {
                        "role": "system",
                        "text": `Найди в тексте следующую информцию: Тип питомца (Кошка (если будет написано кот - пиши Кошка), Собака (если будет написано пес - пиши Собака), Кролик, Обезьяна), Имя питомца, Причину поиска, Количество мл крови, Количество доноров, Группу крови питомца, Дата окончания поиска донора, Ветклиника, Город, ФИО хозяина, Номер телефона
                        После чего выдай ответ формата JSON. Пример ответа: 
                        "{
                            petType,
                            petName,
                            reason
                            amountOfBlood,
                            donorsSize,
                            bloodGroup,
                            dateEndOfSearch,
                            vet,
                            city,
                            fullName,
                            contact
                        }"

                        dateEndOfSearch заполни как timestamp формата ISO

                        Ответ дай только в формате JSON`
                    },
                    {
                        "role": "user",
                        "text": msg.text
                    }
                ]
            }

            const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Api-Key ' + process.env.YANDEX_AUTHORISATION_KEY
                },
                body: JSON.stringify(promt)
            })

            const resp = await response.json()
            const respText = resp.result.alternatives[0].message.text
console.log(respText)
            const json = JSON.parse(respText)
            data = json
            await bot.sendMessage(msg.chat.id,
                `Проверьте правильность введенных данных:

Данные питомца:

Что за питомец: ${json.petType},
Имя питомца: ${json.petName}, 
Причина поисков: ${json.reason}, 
Количество мл крови: ${json.amountOfBlood},
Количество доноров: ${json.donorsSize},
Группу крови питомца: ${json.bloodGroup},
Дата окончания поиска донора (день, месяц, год и, если понадобится, время): ${dateformat(json.dateEndOfSearch, 'dd.mm.yy HH:MM')},
Ветклинику, куда привезти донора: ${json.vet},

Данные хозяина:

ФИО: ${json.fullName},
Телефон: ${json.contact},
Город: ${json.city}`
                , {
                    reply_markup: {
                        inline_keyboard: [
                            [{ text: 'Все верно', callback_data: 'allOk' }],
                            [{ text: 'Редактировать', callback_data: 'remake' }]
                        ]
                    }
                })
        }
    } catch (error) {
        console.log(error)
    }

})

let data = null
bot.on('callback_query', async ctx => {
    try {
        switch (ctx.data) {
            case "exit":
                data = null
                isVoiceEnable = false
                await bot.editMessageReplyMarkup({}, { chat_id: ctx.message.chat.id, message_id: ctx.message.message_id })
                await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id)
                await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id - 1)
                await bot.deleteMessage(ctx.message.chat.id, ctx.message.message_id - 2)
                break
            case "voice":
                await bot.editMessageReplyMarkup({}, { chat_id: ctx.message.chat.id, message_id: ctx.message.message_id })
                isVoiceEnable = true
                await bot.sendMessage(ctx.message.chat.id, `Запишите голосовое сообщение согласно форме выше`)

                bot.on('voice', async voice => {
                    if (isVoiceEnable) {
                        let file = await bot.getFile(voice.voice.file_id)

                        const msgWait = await bot.sendMessage(voice.chat.id, `Подождите немного, обработка сообщения...`)

                        if (file) {
                            const url = 'https://api.telegram.org/file/bot' + process.env.API_KEY_BOT + '/' + file.file_path
                            const result = await fetch(url, {
                                method: "POST"
                            })

                            if (result) {
                                try {
                                    if (!fs.existsSync(tmpDir)) {
                                        fs.mkdirSync(tmpDir)
                                    }

                                    const filePath = path.resolve(tmpDir, file.file_path.substring(6))
                                    await download({
                                        url: url,
                                        path: filePath
                                    })

                                    const text = await transcriptVoice(filePath)

                                    fs.rmSync(tmpDir, { recursive: true, force: true })

                                    const promt = {
                                        "modelUri": "gpt://" + process.env.YANDEX_DIRECTORY_ID + "/yandexgpt",
                                        "completionOptions": {
                                            "stream": false,
                                            "temperature": 0.6,
                                            "maxTokens": "2000"
                                        },
                                        "messages": [
                                            {
                                                "role": "system",
                                                "text": `Найди в тексте следующую информцию: Тип питомца (Кошка (если будет написано кот - пиши Кошка), Собака (если будет написано пес - пиши Собака), Кролик, Обезьяна), Имя питомца, Причину поиска, Количество мл крови, Количество доноров, Группу крови питомца, Дата окончания поиска донора, Ветклиника, Город, ФИО хозяина, Номер телефона
                                                После чего выдай ответ формата JSON. Пример ответа: 
                                                "{
                                                    petType,
                                                    petName,
                                                    reason
                                                    amountOfBlood,
                                                    donorsSize,
                                                    bloodGroup,
                                                    dateEndOfSearch,
                                                    vet,
                                                    city,
                                                    fullName,
                                                    contact
                                                }"

                                                dateEndOfSearch заполни как timestamp формата ISO

                                                Ответ дай только в формате JSON`
                                            },
                                            {
                                                "role": "user",
                                                "text": text
                                            }
                                        ]
                                    }

                                    const response = await fetch('https://llm.api.cloud.yandex.net/foundationModels/v1/completion', {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                            'Authorization': 'Api-Key ' + process.env.YANDEX_AUTHORISATION_KEY
                                        },
                                        body: JSON.stringify(promt)
                                    })

                                    const resp = await response.json()
                                    const respText = resp.result.alternatives[0].message.text
console.log(respText)
                                    const json = JSON.parse(respText)
                                    data = json
                                    await bot.sendMessage(ctx.message.chat.id,
                                        `Проверьте правильность введенных данных:

Данные питомца:

Что за питомец: ${json.petType},
Имя питомца: ${json.petName}, 
Причина поисков: ${json.reason}, 
Количество мл крови: ${json.amountOfBlood},
Количество доноров: ${json.donorsSize},
Группу крови питомца: ${json.bloodGroup},
Дата окончания поиска донора (день, месяц, год и, если понадобится, время): ${dateformat(json.dateEndOfSearch, 'dd.mm.yy HH:MM')},
Ветклинику, куда привезти донора: ${json.vet},

Данные хозяина:

ФИО: ${json.fullName},
Телефон: ${json.contact},
Город: ${json.city}`
                                        , {
                                            reply_markup: {
                                                inline_keyboard: [
                                                    [{ text: 'Все верно', callback_data: 'allOk' }],
                                                    [{ text: 'Редактировать', callback_data: 'remake' }]
                                                ]
                                            }
                                        })
                                    await bot.deleteMessage(msgWait.chat.id, msgWait.message_id)
                                } catch (err) {
                                    console.error(err)
                                }
                            }
                        }
                    }
                    isVoiceEnable = false
                })

                break
            case 'allOk':
                const date = new Date()
                const request = await dbQuery(
                    `insert into "donationRequests" ("fullName",contact,"petType","petName",reason,"amountOfBlood","donorsSize","bloodGroup",city,vet,"dateEndOfSearch", "createdAt", "updatedAt")
                    values ('${data.fullName}','${data.contact}','${data.petType}','${data.petName}','${data.reason}',${data.amountOfBlood},${data.donorsSize},'${data.bloodGroup}','${data.city}','${data.vet}','${data.dateEndOfSearch}', '${date.toISOString()}', '${date.toISOString()}')`)
                if (request) {
                    await bot.sendMessage(ctx.message.chat.id, `Заявка оформлена и отправлена на модерацию, ожидайте ответа`)
                }
                break
            case 'remake':
                await bot.editMessageReplyMarkup({}, { chat_id: ctx.message.chat.id, message_id: ctx.message.message_id })
                await bot.sendMessage(ctx.message.chat.id, `Скопируйте сообщение выше, исправьте нужные вам данные и напишите в самом начале сообщения: Отредактировано`)
            case "text":
                isVoiceEnable = false

                break
        }
    }
    catch (error) {
        console.log(error)
    }

})

// bot.on('voice', async voice => {
//     if (isVoiceEnable) {
//         let file = await bot.getFile(voice.voice.file_id)

//         const msgWait = await bot.sendMessage(voice.chat.id, `Подождите немного, превращаю голос в текст...`)

//         if (file) {
//             const url = 'https://api.telegram.org/file/bot' + process.env.API_KEY_BOT + '/' + file.file_path
//             const result = await fetch(url, {
//                 method: "POST"
//             })

//             if (result) {
//                 try {
//                     if (!fs.existsSync(tmpDir)) {
//                         fs.mkdirSync(tmpDir)
//                     }

//                     const filePath = path.resolve(tmpDir, file.file_path.substring(6))
//                     await download({
//                         url: url,
//                         path: filePath
//                     })

//                     const text = await transcriptVoice(filePath)

//                     fs.rmSync(tmpDir, { recursive: true, force: true })

//                     await bot.editMessageText(text, {
//                         chat_id: msgWait.chat.id,
//                         message_id: msgWait.message_id
//                     })

//                 } catch (err) {
//                     console.error(err)
//                 }
//             }
//         }
//     }
//     isVoiceEnable = false
// })

const commands = [
    {
        command: "start",
        description: "Запуск бота"
    },
    {
        command: "menu",
        description: "Меню"
    },

]

bot.setMyCommands(commands)