# Установка
```
npm install --save @react-hooks
```

# Версионирование

Номер пакета должнен состоять из трёх обязательных номерных версий: `{major}.{minor}.{patch}.`

  - **Патч версия** — используется для внесения мелких изменений, исправлений ошибок или легкий рефакторинг кода.

  - **Минорная версия** — предназначена для добавления нового функционала, изменения интерфейса или внесения больших изменений, которые соблюдают обратную совместимость. Если модифицируется хук (либо переносится/добавляется с отличающимся интерфейсом), то нужно добавить в название хука версию методом инкримента и повысить минорную версию библиотеки.

  - **Мажорная версия** — та версия, в которой можно полностью менять поведение, удалять старый код и т.д. Изменение в текущей версии может сильно различаться с той, что используется на данный момент проектом. Они могут быть совершенно несовместимы. Когда накапливается большое количество версий хуков, то их необходимо смержить и повысить мажорную версию. Переход на мажорную вернсию согласовывается разработчиками.

# Разработка

  - Запустить команду:
      ```
      npm link
      ```
  - Открыть свой проект, в котором планируется применить библиотеку и выполнить:
      ```
      npm link @react-hooks
      npm run start
      ```

    После этого, пакет будет добавлен в проект.

  - При внесении изменений в `@react-hooks`, необходимо выполнить команду
      ```
      npm run build
      ```
    Новые изменения в проекте автоматически применятся.

  - Чтобы убрать линк, нужно выполнить команду:
      ```
      npm unlink --no-save @react-hooks
      ```

# Тестирование
Для тестирования хуков используется библиотека [react-hooks-testing-library](https://github.com/testing-library/react-hooks-testing-library)
```
npm run test
# to clear cache use jest --clearCache
```
