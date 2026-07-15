/* =========================================================
   codeboot — course data & app logic
   ========================================================= */

const COURSES = {

  javascript: {
    name: "JavaScript",
    ext: ".js",
    accent: "#f7c948",
    typed: "console.log('Привет, мир!');",
    level: "с нуля → уверенный уровень",
    lessons: [
      {
        title: "Введение в JavaScript",
        eyebrow: "01 · старт",
        content: `
          <p>JavaScript — язык, на котором работает практически весь интерактив в браузере: анимации, формы, карты, чаты. Кроме браузера, JS работает и на сервере благодаря <strong>Node.js</strong>, поэтому один язык покрывает и фронтенд, и бэкенд.</p>
          <p>Чтобы начать, ничего не нужно устанавливать: JavaScript уже встроен в любой браузер. Открой консоль разработчика (клавиша <code>F12</code> или <code>Ctrl+Shift+I</code>), перейди во вкладку <strong>Console</strong> — это твоя первая песочница.</p>
          <ul>
            <li>Код выполняется построчно, сверху вниз</li>
            <li>Регистр букв важен: <code>Name</code> и <code>name</code> — разные вещи</li>
            <li>Каждая инструкция обычно заканчивается точкой с запятой <code>;</code></li>
          </ul>
        `,
        code: { text: `// это комментарий — код его не выполняет
console.log("Привет, мир!"); // выводит текст в консоль` },
        callout: "Открой консоль браузера прямо сейчас и напиши свою первую строку кода — лучший способ начать."
      },
      {
        title: "Переменные и типы данных",
        eyebrow: "02 · основы",
        content: `
          <p>Переменная — это именованная ячейка для хранения значения. В JS есть три способа объявить переменную:</p>
          <ul>
            <li><code>let</code> — значение можно менять (основной выбор по умолчанию)</li>
            <li><code>const</code> — значение задаётся один раз и не меняется</li>
            <li><code>var</code> — устаревший способ, в новом коде почти не используется</li>
          </ul>
          <p>Основные типы данных: <strong>число</strong> (Number), <strong>строка</strong> (String), <strong>логическое значение</strong> (Boolean: true/false), <strong>массив</strong>, <strong>объект</strong>, а также <code>null</code> и <code>undefined</code> для «ничего».</p>
        `,
        code: { text: `let age = 25;             // число
const name = "Алекс";     // строка, не изменится
let isStudent = true;     // логическое значение

console.log(typeof age);      // "number"
console.log(typeof name);     // "string"
console.log(\`Меня зовут \${name}, мне \${age}\`); // шаблонная строка` },
        callout: "Используй <strong>const</strong> по умолчанию, и только если значение реально должно меняться — переключайся на <strong>let</strong>."
      },
      {
        title: "Операторы",
        eyebrow: "03 · основы",
        content: `
          <p>Операторы позволяют выполнять действия над значениями.</p>
          <ul>
            <li><strong>Арифметические:</strong> <code>+ - * / %</code> (остаток от деления) и <code>**</code> (степень)</li>
            <li><strong>Сравнения:</strong> <code>==</code> сравнивает только значение, <code>===</code> — значение и тип (используй всегда <code>===</code>)</li>
            <li><strong>Логические:</strong> <code>&&</code> (И), <code>||</code> (ИЛИ), <code>!</code> (НЕ)</li>
            <li><strong>Присваивания:</strong> <code>=</code>, <code>+=</code>, <code>-=</code> и т.д.</li>
          </ul>
        `,
        code: { text: `let a = 10, b = 3;
console.log(a % b);      // 1 — остаток от деления
console.log(a ** 2);     // 100 — возведение в степень

console.log(5 === "5");  // false — разные типы
console.log(5 == "5");   // true — сравнивает только значение

let logged = true, isAdmin = false;
console.log(logged && isAdmin); // false` },
        callout: null
      },
      {
        title: "Условные конструкции",
        eyebrow: "04 · логика",
        content: `
          <p>Условия позволяют коду принимать решения. Основная конструкция — <code>if / else if / else</code>.</p>
          <p>Если вариантов много и они зависят от одного значения — удобнее <code>switch</code>. Также есть короткая запись — тернарный оператор <code>условие ? если_да : если_нет</code>.</p>
        `,
        code: { text: `let score = 78;

if (score >= 90) {
  console.log("Отлично");
} else if (score >= 70) {
  console.log("Хорошо");
} else {
  console.log("Есть куда расти");
}

// тернарный оператор
const status = score >= 70 ? "сдал" : "пересдача";
console.log(status);` },
        callout: "Избегай глубокой вложенности <code>if</code> — если условий больше 3-4, подумай про <code>switch</code> или отдельную функцию."
      },
      {
        title: "Циклы",
        eyebrow: "05 · логика",
        content: `
          <p>Циклы повторяют действие много раз без копирования кода.</p>
          <ul>
            <li><code>for</code> — когда известно, сколько раз повторять</li>
            <li><code>while</code> — пока условие истинно</li>
            <li><code>for...of</code> — перебор элементов массива или строки</li>
          </ul>
        `,
        code: { text: `for (let i = 1; i <= 5; i++) {
  console.log("Итерация №" + i);
}

let fruits = ["яблоко", "банан", "киви"];
for (const fruit of fruits) {
  console.log(fruit);
}

let n = 5;
while (n > 0) {
  console.log(n);
  n--; // важно: без этого цикл будет бесконечным
}` },
        callout: "<strong>Бесконечный цикл</strong> — частая ошибка новичков: всегда проверяй, что условие рано или поздно станет ложным."
      },
      {
        title: "Функции",
        eyebrow: "06 · структура кода",
        content: `
          <p>Функция — это блок кода, который можно вызывать многократно. Она может принимать параметры и возвращать результат через <code>return</code>.</p>
          <p>Помимо классического объявления, в JS часто используют <strong>стрелочные функции</strong> — компактный современный синтаксис.</p>
        `,
        code: { text: `function sum(a, b) {
  return a + b;
}
console.log(sum(4, 5)); // 9

// стрелочная функция — то же самое короче
const multiply = (a, b) => a * b;
console.log(multiply(3, 3)); // 9

// параметр по умолчанию
function greet(name = "гость") {
  return \`Привет, \${name}!\`;
}
console.log(greet()); // "Привет, гость!"` },
        callout: null
      },
      {
        title: "Массивы и объекты",
        eyebrow: "07 · структуры данных",
        content: `
          <p><strong>Массив</strong> — упорядоченный список значений. <strong>Объект</strong> — набор пар «ключ: значение», удобен для описания сущностей.</p>
          <p>Массивы имеют мощные встроенные методы: <code>map</code> (преобразовать каждый элемент), <code>filter</code> (оставить нужные), <code>forEach</code> (пройтись по каждому).</p>
        `,
        code: { text: `let numbers = [1, 2, 3, 4, 5];

let doubled = numbers.map(n => n * 2);
console.log(doubled); // [2, 4, 6, 8, 10]

let even = numbers.filter(n => n % 2 === 0);
console.log(even); // [2, 4]

let user = {
  name: "Мария",
  age: 28,
  isAdmin: false
};
console.log(user.name);  // "Мария"
user.age = 29;            // изменить свойство` },
        callout: "Методы <code>map</code>, <code>filter</code>, <code>reduce</code> — основа современного JS. Освоив их, ты перестанешь писать длинные ручные циклы."
      },
      {
        title: "Основы ООП: классы",
        eyebrow: "08 · ООП",
        content: `
          <p>Классы — шаблон для создания объектов со схожими свойствами и поведением (методами). <code>constructor</code> — специальный метод, который вызывается при создании объекта через <code>new</code>.</p>
        `,
        code: { text: `class Animal {
  constructor(name, sound) {
    this.name = name;
    this.sound = sound;
  }
  makeSound() {
    console.log(\`\${this.name} говорит: \${this.sound}\`);
  }
}

const cat = new Animal("Кот", "Мяу");
cat.makeSound(); // "Кот говорит: Мяу"

// наследование
class Dog extends Animal {
  constructor(name) {
    super(name, "Гав");
  }
}
new Dog("Барон").makeSound(); // "Барон говорит: Гав"` },
        callout: null
      },
      {
        title: "Обработка ошибок и асинхронность",
        eyebrow: "09 · продвинутый уровень",
        content: `
          <p><code>try / catch</code> позволяет перехватывать ошибки, не роняя всю программу. Это особенно важно при работе с внешними данными — например, запросами к серверу.</p>
          <p>JS часто выполняет операции <strong>асинхронно</strong> (не блокируя остальной код) — для этого используются <code>Promise</code> и удобный синтаксис <code>async/await</code>.</p>
        `,
        code: { text: `function divide(a, b) {
  if (b === 0) throw new Error("Деление на ноль");
  return a / b;
}

try {
  console.log(divide(10, 0));
} catch (error) {
  console.log("Ошибка:", error.message);
}

// асинхронный запрос данных
async function loadUser() {
  const response = await fetch("https://api.example.com/user");
  const data = await response.json();
  console.log(data);
}` },
        callout: "<code>fetch</code> — стандартный способ получать данные с сервера прямо из браузера."
      },
      {
        title: "Куда двигаться дальше",
        eyebrow: "10 · итог",
        content: `
          <p>Ты прошёл путь от первой строки кода до классов и асинхронности — этого достаточно, чтобы писать реальные небольшие программы. Дальше стоит закрепить материал практикой:</p>
          <ul>
            <li>Напиши консольный калькулятор с функциями</li>
            <li>Сделай список задач (to-do list), используя массив объектов</li>
            <li>Изучи манипуляции с DOM — управление HTML-страницей через JS</li>
            <li>Попробуй Node.js, чтобы запускать JS вне браузера</li>
          </ul>
          <p>Программирование — навык, который закрепляется только практикой. Возвращайся к урокам, меняй примеры, ломай их и чини — так знания остаются в памяти.</p>
        `,
        code: null,
        callout: "Совет: выбери маленький проект (например, конвертер валют) и доведи его до конца — это даст больше, чем десять пройденных уроков без практики."
      }
    ]
  },

  python: {
    name: "Python",
    ext: ".py",
    accent: "#4fd1c5",
    typed: "print('Привет, мир!')",
    level: "с нуля → уверенный уровень",
    lessons: [
      {
        title: "Введение в Python",
        eyebrow: "01 · старт",
        content: `
          <p>Python — один из самых читаемых языков программирования: код похож на обычный текст, без лишних скобок. Он используется в анализе данных, автоматизации, веб-разработке и машинном обучении.</p>
          <p>Чтобы попробовать код без установки — используй любой онлайн-редактор (например, replit.com) или установи Python с <strong>python.org</strong> и запускай файлы командой <code>python file.py</code>.</p>
          <ul>
            <li>Python не использует фигурные скобки — блоки кода задаются <strong>отступами</strong></li>
            <li>Отступ обычно — 4 пробела</li>
            <li>Комментарий начинается с <code>#</code></li>
          </ul>
        `,
        code: { text: `# это комментарий
print("Привет, мир!")  # выводит текст на экран` },
        callout: "В Python отступы — часть синтаксиса, а не просто красота: неправильный отступ вызовет ошибку."
      },
      {
        title: "Переменные и типы данных",
        eyebrow: "02 · основы",
        content: `
          <p>В Python не нужно указывать тип переменной заранее — он определяется автоматически по значению.</p>
          <p>Основные типы: <code>int</code> (целое число), <code>float</code> (дробное число), <code>str</code> (строка), <code>bool</code> (True/False), <code>list</code>, <code>dict</code>.</p>
        `,
        code: { text: `age = 25              # int
name = "Алекс"        # str
height = 1.78         # float
is_student = True     # bool

print(type(age))       # <class 'int'>
print(f"Меня зовут {name}, мне {age}")  # f-строка` },
        callout: null
      },
      {
        title: "Операторы",
        eyebrow: "03 · основы",
        content: `
          <p>Основные операторы очень похожи на математику:</p>
          <ul>
            <li><strong>Арифметические:</strong> <code>+ - * /</code>, <code>//</code> (целочисленное деление), <code>%</code> (остаток), <code>**</code> (степень)</li>
            <li><strong>Сравнения:</strong> <code>== != > < >= <=</code></li>
            <li><strong>Логические:</strong> <code>and</code>, <code>or</code>, <code>not</code> (пишутся словами, а не символами)</li>
          </ul>
        `,
        code: { text: `a, b = 10, 3
print(a % b)      # 1
print(a ** 2)     # 100
print(a // b)     # 3 — целочисленное деление

logged, is_admin = True, False
print(logged and is_admin)  # False` },
        callout: null
      },
      {
        title: "Условные конструкции",
        eyebrow: "04 · логика",
        content: `
          <p>Условия в Python записываются через <code>if / elif / else</code>. Обрати внимание: вместо фигурных скобок используется <strong>двоеточие и отступ</strong>.</p>
        `,
        code: { text: `score = 78

if score >= 90:
    print("Отлично")
elif score >= 70:
    print("Хорошо")
else:
    print("Есть куда расти")

# короткая запись
status = "сдал" if score >= 70 else "пересдача"
print(status)` },
        callout: "Забытое двоеточие <code>:</code> после <code>if</code> — самая частая ошибка синтаксиса у новичков."
      },
      {
        title: "Циклы",
        eyebrow: "05 · логика",
        content: `
          <p>Основной цикл в Python — <code>for</code>, который перебирает элементы последовательности. Функция <code>range()</code> генерирует числовую последовательность.</p>
        `,
        code: { text: `for i in range(1, 6):
    print(f"Итерация №{i}")

fruits = ["яблоко", "банан", "киви"]
for fruit in fruits:
    print(fruit)

n = 5
while n > 0:
    print(n)
    n -= 1  # без этого цикл будет бесконечным` },
        callout: null
      },
      {
        title: "Функции",
        eyebrow: "06 · структура кода",
        content: `
          <p>Функция объявляется через ключевое слово <code>def</code>. Значение возвращается через <code>return</code>. Параметры могут иметь значения по умолчанию.</p>
        `,
        code: { text: `def sum_numbers(a, b):
    return a + b

print(sum_numbers(4, 5))  # 9

def greet(name="гость"):
    return f"Привет, {name}!"

print(greet())          # "Привет, гость!"
print(greet("Мария"))   # "Привет, Мария!"

# лямбда-функция — компактная безымянная функция
multiply = lambda a, b: a * b
print(multiply(3, 3))   # 9` },
        callout: null
      },
      {
        title: "Списки, кортежи и словари",
        eyebrow: "07 · структуры данных",
        content: `
          <p><strong>Список (list)</strong> — изменяемая упорядоченная коллекция. <strong>Кортеж (tuple)</strong> — то же самое, но неизменяемое. <strong>Словарь (dict)</strong> — пары «ключ: значение».</p>
          <p><strong>List comprehension</strong> — фирменная фича Python: короткая запись для создания списков.</p>
        `,
        code: { text: `numbers = [1, 2, 3, 4, 5]

doubled = [n * 2 for n in numbers]      # list comprehension
print(doubled)  # [2, 4, 6, 8, 10]

even = [n for n in numbers if n % 2 == 0]
print(even)     # [2, 4]

user = {"name": "Мария", "age": 28}
print(user["name"])  # "Мария"
user["age"] = 29       # изменить значение` },
        callout: "List comprehension заменяет 3-4 строки ручного цикла одной строкой — это то, за что Python любят."
      },
      {
        title: "Основы ООП: классы",
        eyebrow: "08 · ООП",
        content: `
          <p>Класс описывает шаблон объекта. Метод <code>__init__</code> — конструктор, вызывается при создании объекта. <code>self</code> ссылается на сам объект.</p>
        `,
        code: { text: `class Animal:
    def __init__(self, name, sound):
        self.name = name
        self.sound = sound

    def make_sound(self):
        print(f"{self.name} говорит: {self.sound}")

cat = Animal("Кот", "Мяу")
cat.make_sound()  # "Кот говорит: Мяу"

# наследование
class Dog(Animal):
    def __init__(self, name):
        super().__init__(name, "Гав")

Dog("Барон").make_sound()  # "Барон говорит: Гав"` },
        callout: null
      },
      {
        title: "Обработка ошибок",
        eyebrow: "09 · продвинутый уровень",
        content: `
          <p><code>try / except</code> перехватывает ошибки, не давая программе упасть. Можно указывать конкретный тип исключения, чтобы обрабатывать разные ошибки по-разному.</p>
        `,
        code: { text: `def divide(a, b):
    if b == 0:
        raise ValueError("Деление на ноль")
    return a / b

try:
    print(divide(10, 0))
except ValueError as error:
    print("Ошибка:", error)
finally:
    print("Проверка завершена")` },
        callout: null
      },
      {
        title: "Куда двигаться дальше",
        eyebrow: "10 · итог",
        content: `
          <p>Ты изучил переменные, условия, циклы, функции, структуры данных, классы и обработку ошибок — базу, достаточную для написания реальных скриптов. Дальнейшие шаги:</p>
          <ul>
            <li>Напиши скрипт, который сортирует список файлов в папке</li>
            <li>Сделай текстовую игру-викторину с вопросами и подсчётом очков</li>
            <li>Изучи библиотеки <code>pandas</code> (данные) или <code>requests</code> (веб-запросы)</li>
            <li>Попробуй фреймворк <code>Flask</code>, чтобы сделать свой первый веб-сервер</li>
          </ul>
        `,
        code: null,
        callout: "Python особенно силён в автоматизации рутины — попробуй автоматизировать что-то из своих повседневных задач."
      }
    ]
  },

  java: {
    name: "Java",
    ext: ".java",
    accent: "#ff8a65",
    typed: 'System.out.println("Привет, мир!");',
    level: "с нуля → уверенный уровень",
    lessons: [
      {
        title: "Введение в Java",
        eyebrow: "01 · старт",
        content: `
          <p>Java — строго типизированный язык, на котором построены Android-приложения, банковские системы и корпоративное ПО. Девиз языка — «написано один раз, работает везде» — код компилируется в универсальный байткод.</p>
          <p>Для работы установи <strong>JDK</strong> (Java Development Kit) с сайта adoptium.net. Каждая программа состоит из <strong>классов</strong>, а выполнение начинается с метода <code>main</code>.</p>
        `,
        code: { text: `public class Main {
    public static void main(String[] args) {
        // это комментарий
        System.out.println("Привет, мир!");
    }
}` },
        callout: "В Java даже одна строка кода должна находиться внутри класса и метода — так устроен язык."
      },
      {
        title: "Переменные и типы данных",
        eyebrow: "02 · основы",
        content: `
          <p>Java — язык со <strong>статической типизацией</strong>: тип переменной указывается явно и не меняется.</p>
          <p>Основные типы: <code>int</code> (целое), <code>double</code> (дробное), <code>String</code> (строка), <code>boolean</code> (true/false), <code>char</code> (один символ).</p>
        `,
        code: { text: `int age = 25;
String name = "Алекс";
double height = 1.78;
boolean isStudent = true;

System.out.println("Меня зовут " + name + ", мне " + age);` },
        callout: null
      },
      {
        title: "Операторы",
        eyebrow: "03 · основы",
        content: `
          <p>Операторы во многом совпадают с C-подобными языками:</p>
          <ul>
            <li><strong>Арифметические:</strong> <code>+ - * / %</code></li>
            <li><strong>Сравнения:</strong> <code>== != > < >= <=</code> (для чисел и boolean)</li>
            <li><strong>Логические:</strong> <code>&&</code>, <code>||</code>, <code>!</code></li>
          </ul>
          <p>Важно: строки сравниваются не через <code>==</code>, а через метод <code>.equals()</code>.</p>
        `,
        code: { text: `int a = 10, b = 3;
System.out.println(a % b);   // 1

String s1 = "код";
String s2 = "код";
System.out.println(s1.equals(s2)); // true — правильное сравнение строк` },
        callout: "Ошибка новичков — сравнивать строки через <code>==</code>. Для этого используй <code>.equals()</code>."
      },
      {
        title: "Условные конструкции",
        eyebrow: "04 · логика",
        content: `
          <p>Синтаксис условий — как в большинстве C-подобных языков: <code>if / else if / else</code> с фигурными скобками.</p>
        `,
        code: { text: `int score = 78;

if (score >= 90) {
    System.out.println("Отлично");
} else if (score >= 70) {
    System.out.println("Хорошо");
} else {
    System.out.println("Есть куда расти");
}

String status = score >= 70 ? "сдал" : "пересдача";
System.out.println(status);` },
        callout: null
      },
      {
        title: "Циклы",
        eyebrow: "05 · логика",
        content: `
          <p>Java поддерживает <code>for</code>, <code>while</code> и удобный <code>for-each</code> для перебора коллекций и массивов.</p>
        `,
        code: { text: `for (int i = 1; i <= 5; i++) {
    System.out.println("Итерация №" + i);
}

String[] fruits = {"яблоко", "банан", "киви"};
for (String fruit : fruits) {
    System.out.println(fruit);
}

int n = 5;
while (n > 0) {
    System.out.println(n);
    n--;
}` },
        callout: null
      },
      {
        title: "Методы",
        eyebrow: "06 · структура кода",
        content: `
          <p>В Java функции называются <strong>методами</strong> и всегда объявляются внутри класса. Обязательно указывается тип возвращаемого значения — или <code>void</code>, если метод ничего не возвращает.</p>
        `,
        code: { text: `public class Main {
    static int sum(int a, int b) {
        return a + b;
    }

    static void greet(String name) {
        System.out.println("Привет, " + name + "!");
    }

    public static void main(String[] args) {
        System.out.println(sum(4, 5)); // 9
        greet("Мария");                // "Привет, Мария!"
    }
}` },
        callout: null
      },
      {
        title: "Массивы и коллекции",
        eyebrow: "07 · структуры данных",
        content: `
          <p><strong>Массив</strong> имеет фиксированный размер и один тип элементов. Для гибкого списка с изменяемым размером используется <code>ArrayList</code> из пакета <code>java.util</code>.</p>
        `,
        code: { text: `import java.util.ArrayList;

int[] numbers = {1, 2, 3, 4, 5};
System.out.println(numbers[0]); // 1

ArrayList<String> names = new ArrayList<>();
names.add("Анна");
names.add("Игорь");
names.remove("Анна");
System.out.println(names); // [Игорь]` },
        callout: "<code>ArrayList</code> — самый используемый способ хранить список данных, когда заранее неизвестен размер."
      },
      {
        title: "Основы ООП: классы",
        eyebrow: "08 · ООП",
        content: `
          <p>Java построена вокруг ООП: практически весь код — это классы с полями и методами. Конструктор — специальный метод с именем класса, вызывается при создании объекта через <code>new</code>.</p>
        `,
        code: { text: `class Animal {
    String name;
    String sound;

    Animal(String name, String sound) {
        this.name = name;
        this.sound = sound;
    }

    void makeSound() {
        System.out.println(name + " говорит: " + sound);
    }
}

class Dog extends Animal {
    Dog(String name) {
        super(name, "Гав");
    }
}

// использование:
new Animal("Кот", "Мяу").makeSound();
new Dog("Барон").makeSound();` },
        callout: null
      },
      {
        title: "Обработка исключений",
        eyebrow: "09 · продвинутый уровень",
        content: `
          <p>Java использует <code>try / catch</code> для обработки исключений — ошибок, возникающих во время выполнения программы, чтобы она не завершалась аварийно.</p>
        `,
        code: { text: `public static double divide(int a, int b) {
    if (b == 0) {
        throw new ArithmeticException("Деление на ноль");
    }
    return (double) a / b;
}

try {
    System.out.println(divide(10, 0));
} catch (ArithmeticException e) {
    System.out.println("Ошибка: " + e.getMessage());
}` },
        callout: null
      },
      {
        title: "Куда двигаться дальше",
        eyebrow: "10 · итог",
        content: `
          <p>Ты освоил переменные, условия, циклы, методы, коллекции, классы и исключения — фундамент, на котором строится всё Java-разработка. Дальше:</p>
          <ul>
            <li>Напиши консольную программу учёта расходов с классами Category и Expense</li>
            <li>Изучи интерфейсы и полиморфизм подробнее</li>
            <li>Попробуй Spring Boot — основной фреймворк для серверной разработки на Java</li>
            <li>Изучи основы Android-разработки, если интересна разработка мобильных приложений</li>
          </ul>
        `,
        code: null,
        callout: "Java — отличный выбор, если интересны большие корпоративные системы или разработка под Android."
      }
    ]
  },

  cpp: {
    name: "C++",
    ext: ".cpp",
    accent: "#7c9eff",
    typed: 'std::cout << "Привет, мир!";',
    level: "с нуля → уверенный уровень",
    lessons: [
      {
        title: "Введение в C++",
        eyebrow: "01 · старт",
        content: `
          <p>C++ — язык, дающий низкоуровневый контроль над памятью и максимальную производительность. На нём пишут игровые движки, операционные системы и высоконагруженный софт.</p>
          <p>Для запуска кода нужен компилятор — например, <strong>g++</strong> (часть GCC) или онлайн-редактор вроде godbolt.org. Каждая программа начинается с функции <code>main()</code>.</p>
        `,
        code: { text: `#include <iostream>

int main() {
    // это комментарий
    std::cout << "Привет, мир!" << std::endl;
    return 0;
}` },
        callout: "Строка <code>#include &lt;iostream&gt;</code> подключает библиотеку ввода-вывода — без неё <code>std::cout</code> не будет работать."
      },
      {
        title: "Переменные и типы данных",
        eyebrow: "02 · основы",
        content: `
          <p>C++ — язык со статической типизацией: тип переменной задаётся явно при объявлении.</p>
          <p>Основные типы: <code>int</code> (целое), <code>double</code> (дробное), <code>std::string</code> (строка), <code>bool</code> (true/false), <code>char</code> (символ).</p>
        `,
        code: { text: `#include <iostream>
#include <string>

int main() {
    int age = 25;
    std::string name = "Алекс";
    double height = 1.78;
    bool isStudent = true;

    std::cout << "Меня зовут " << name << ", мне " << age << std::endl;
    return 0;
}` },
        callout: null
      },
      {
        title: "Операторы",
        eyebrow: "03 · основы",
        content: `
          <ul>
            <li><strong>Арифметические:</strong> <code>+ - * / %</code></li>
            <li><strong>Сравнения:</strong> <code>== != > < >= <=</code></li>
            <li><strong>Логические:</strong> <code>&&</code>, <code>||</code>, <code>!</code></li>
          </ul>
          <p>При делении двух целых чисел (<code>int</code>) результат тоже будет целым — дробная часть просто отбрасывается.</p>
        `,
        code: { text: `int a = 10, b = 3;
std::cout << a % b << std::endl;     // 1
std::cout << a / b << std::endl;     // 3, не 3.33
std::cout << (double)a / b << std::endl; // 3.333... — явное приведение типа` },
        callout: "Деление <code>int / int</code> отбрасывает дробную часть — частая причина неожиданных багов у новичков."
      },
      {
        title: "Условные конструкции",
        eyebrow: "04 · логика",
        content: `
          <p>Условия записываются так же, как в большинстве C-подобных языков: <code>if / else if / else</code>.</p>
        `,
        code: { text: `int score = 78;

if (score >= 90) {
    std::cout << "Отлично";
} else if (score >= 70) {
    std::cout << "Хорошо";
} else {
    std::cout << "Есть куда расти";
}

std::string status = (score >= 70) ? "сдал" : "пересдача";` },
        callout: null
      },
      {
        title: "Циклы",
        eyebrow: "05 · логика",
        content: `
          <p>Доступны <code>for</code>, <code>while</code> и упрощённый <strong>range-based for</strong> для перебора массивов и контейнеров.</p>
        `,
        code: { text: `for (int i = 1; i <= 5; i++) {
    std::cout << "Итерация №" << i << std::endl;
}

int numbers[] = {1, 2, 3, 4, 5};
for (int n : numbers) {          // range-based for
    std::cout << n << " ";
}

int n = 5;
while (n > 0) {
    std::cout << n << " ";
    n--;
}` },
        callout: null
      },
      {
        title: "Функции",
        eyebrow: "06 · структура кода",
        content: `
          <p>Функция объявляется с указанием типа возвращаемого значения. Если функция ничего не возвращает — используется <code>void</code>.</p>
        `,
        code: { text: `#include <iostream>

int sum(int a, int b) {
    return a + b;
}

void greet(std::string name) {
    std::cout << "Привет, " << name << "!" << std::endl;
}

int main() {
    std::cout << sum(4, 5) << std::endl; // 9
    greet("Мария");                       // "Привет, Мария!"
    return 0;
}` },
        callout: null
      },
      {
        title: "Массивы и векторы",
        eyebrow: "07 · структуры данных",
        content: `
          <p>Обычный массив в C++ имеет фиксированный размер. Для списка с изменяемым размером используется <code>std::vector</code> — гибкая и самая часто используемая структура данных в C++.</p>
        `,
        code: { text: `#include <vector>
#include <iostream>

int main() {
    std::vector<int> numbers = {1, 2, 3, 4, 5};
    numbers.push_back(6);      // добавить элемент
    numbers.pop_back();        // удалить последний

    for (int n : numbers) {
        std::cout << n << " ";
    }
    std::cout << "\\nРазмер: " << numbers.size();
    return 0;
}` },
        callout: "<code>std::vector</code> — стандартный выбор вместо обычных массивов почти всегда, когда размер может меняться."
      },
      {
        title: "Основы ООП: классы",
        eyebrow: "08 · ООП",
        content: `
          <p>Класс объединяет данные (поля) и поведение (методы). Конструктор — метод, вызываемый при создании объекта, имеет то же имя, что и класс.</p>
        `,
        code: { text: `#include <iostream>
#include <string>

class Animal {
public:
    std::string name, sound;

    Animal(std::string n, std::string s) : name(n), sound(s) {}

    void makeSound() {
        std::cout << name << " говорит: " << sound << std::endl;
    }
};

class Dog : public Animal {
public:
    Dog(std::string n) : Animal(n, "Гав") {}
};

int main() {
    Animal cat("Кот", "Мяу");
    cat.makeSound();
    Dog("Барон").makeSound();
    return 0;
}` },
        callout: null
      },
      {
        title: "Обработка исключений",
        eyebrow: "09 · продвинутый уровень",
        content: `
          <p>C++ использует <code>try / catch</code> и оператор <code>throw</code> для обработки ошибок во время выполнения — например, некорректных входных данных.</p>
        `,
        code: { text: `#include <iostream>
#include <stdexcept>

double divide(int a, int b) {
    if (b == 0) {
        throw std::runtime_error("Деление на ноль");
    }
    return (double)a / b;
}

int main() {
    try {
        std::cout << divide(10, 0);
    } catch (const std::exception& e) {
        std::cout << "Ошибка: " << e.what();
    }
    return 0;
}` },
        callout: null
      },
      {
        title: "Куда двигаться дальше",
        eyebrow: "10 · итог",
        content: `
          <p>Ты прошёл путь от <code>Hello, World</code> до классов, векторов и исключений. Это уверенная база для дальнейшего погружения:</p>
          <ul>
            <li>Изучи указатели и ссылки — ключевую особенность C++</li>
            <li>Разбери «умные указатели» (<code>std::unique_ptr</code>, <code>std::shared_ptr</code>) для безопасной работы с памятью</li>
            <li>Напиши простую консольную игру (например, «крестики-нолики»)</li>
            <li>Изучи стандартную библиотеку STL подробнее: <code>map</code>, <code>set</code>, алгоритмы</li>
          </ul>
        `,
        code: null,
        callout: "C++ вознаграждает терпение: чем глубже понимаешь память и указатели, тем увереннее пишешь быстрый и надёжный код."
      }
    ]
  }
};

/* ========================= APP STATE ========================= */

const state = {
  currentLang: null,
  currentLessonIndex: 0
};

const STORAGE_KEY = "codeboot_progress_v1";

function loadProgress(){
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
  } catch(e){ return {}; }
}
function saveProgress(progress){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch(e){}
}
function isLessonDone(langKey, index){
  const p = loadProgress();
  return !!(p[langKey] && p[langKey][index]);
}
function setLessonDone(langKey, index, done){
  const p = loadProgress();
  if(!p[langKey]) p[langKey] = {};
  p[langKey][index] = done;
  saveProgress(p);
}
function countDone(langKey){
  const p = loadProgress();
  if(!p[langKey]) return 0;
  return Object.values(p[langKey]).filter(Boolean).length;
}

/* ========================= RENDER: SELECT SCREEN ========================= */

const langGrid = document.getElementById("langGrid");

function renderLangGrid(){
  langGrid.innerHTML = "";
  Object.entries(COURSES).forEach(([key, course]) => {
    const card = document.createElement("button");
    card.className = "langcard";
    card.style.setProperty("--card-accent", course.accent);
    card.setAttribute("aria-label", `Начать курс ${course.name}`);

    const done = countDone(key);
    const total = course.lessons.length;

    card.innerHTML = `
      <div class="langcard__bar">
        <span class="langcard__dot"></span>
        <span class="langcard__dot"></span>
        <span class="langcard__dot"></span>
        <span class="langcard__filename">main${course.ext}</span>
      </div>
      <div class="langcard__body">
        <div class="langcard__name">${course.name}</div>
        <div class="langcard__code"><span class="typed-text" data-typed="${encodeURIComponent(course.typed)}"></span><span class="langcard__cursor"></span></div>
      </div>
      <div class="langcard__foot">
        <span class="langcard__level">${course.level}</span>
        <span>${done}/${total} уроков ${done ? "✓" : ""}</span>
      </div>
    `;
    card.addEventListener("click", () => openCourse(key));
    langGrid.appendChild(card);
  });

  // typing animation, staggered per card
  document.querySelectorAll(".typed-text").forEach((el, i) => {
    const full = decodeURIComponent(el.getAttribute("data-typed"));
    setTimeout(() => typeText(el, full), i * 180);
  });
}

function typeText(el, text, speed = 28){
  let i = 0;
  el.textContent = "";
  const timer = setInterval(() => {
    el.textContent += text[i];
    i++;
    if(i >= text.length) clearInterval(timer);
  }, speed);
}

/* ========================= RENDER: COURSE SCREEN ========================= */

const screenSelect = document.getElementById("screenSelect");
const screenCourse = document.getElementById("screenCourse");
const sidebarLangName = document.getElementById("sidebarLangName");
const lessonList = document.getElementById("lessonList");
const lessonView = document.getElementById("lessonView");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const topbarStatusText = document.getElementById("topbarStatusText");

function openCourse(langKey, lessonIndex = 0){
  state.currentLang = langKey;
  state.currentLessonIndex = lessonIndex;

  const course = COURSES[langKey];
  document.documentElement.style.setProperty("--card-accent-global", course.accent);
  screenSelect.classList.add("hidden");
  screenCourse.classList.remove("hidden");
  topbarStatusText.textContent = `${course.name} · в процессе`;

  renderSidebar();
  renderLesson();
  window.scrollTo({ top:0, behavior:"instant" in window ? "instant" : "auto" });
}

function closeCourse(){
  screenCourse.classList.add("hidden");
  screenSelect.classList.remove("hidden");
  topbarStatusText.textContent = "выберите язык";
  renderLangGrid();
}

function renderSidebar(){
  const course = COURSES[state.currentLang];
  sidebarLangName.textContent = `${course.name} ${course.ext}`;
  document.getElementById("sidebar").style.setProperty("--card-accent", course.accent);

  lessonList.innerHTML = "";
  course.lessons.forEach((lesson, i) => {
    const btn = document.createElement("button");
    const done = isLessonDone(state.currentLang, i);
    btn.className = "navitem" + (i === state.currentLessonIndex ? " active" : "") + (done ? " done" : "");
    btn.innerHTML = `<span class="navitem__num">${String(i+1).padStart(2,"0")}</span><span>${lesson.title}</span>`;
    btn.addEventListener("click", () => {
      state.currentLessonIndex = i;
      renderSidebar();
      renderLesson();
    });
    lessonList.appendChild(btn);
  });

  const done = countDone(state.currentLang);
  const total = course.lessons.length;
  progressFill.style.width = `${(done/total)*100}%`;
  progressFill.style.background = course.accent;
  progressLabel.textContent = `${done} / ${total}`;
}

function highlightCode(code){
  // very small, safe highlighter: escape HTML then wrap known tokens
  let escaped = code
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

  // strings (single/double, simple heuristic)
  escaped = escaped.replace(/(&quot;.*?&quot;|"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*')/g, m => `<span class="tok-str">${m}</span>`);
  // comments // ... and # ...
  escaped = escaped.replace(/(\/\/.*$)/gm, m => `<span class="tok-com">${m}</span>`);
  escaped = escaped.replace(/^(\s*#.*$)/gm, m => `<span class="tok-com">${m}</span>`);
  // keywords
  const kw = ["function","return","let","const","var","if","else","for","while","class","extends","new","try","catch","finally","throw","async","await","def","elif","import","from","public","static","void","int","double","string","String","bool","boolean","true","false","True","False","this","self","super","include","namespace","std","break","continue","lambda","raise","except","package","private"];
  escaped = escaped.replace(new RegExp(`\\b(${kw.join("|")})\\b`, "g"), m => `<span class="tok-kw">${m}</span>`);
  // numbers
  escaped = escaped.replace(/\b(\d+\.?\d*)\b/g, m => `<span class="tok-num">${m}</span>`);

  return escaped;
}

function renderLesson(){
  const course = COURSES[state.currentLang];
  const lesson = course.lessons[state.currentLessonIndex];
  const idx = state.currentLessonIndex;
  const total = course.lessons.length;
  const done = isLessonDone(state.currentLang, idx);

  let codeHtml = "";
  if(lesson.code){
    codeHtml = `
      <div class="codeblock">
        <div class="codeblock__head"><span>main${course.ext}</span><span>пример кода</span></div>
        <pre><code>${highlightCode(lesson.code.text)}</code></pre>
      </div>
    `;
  }

  let calloutHtml = "";
  if(lesson.callout){
    calloutHtml = `<div class="lesson__callout"><strong>Совет.</strong> ${lesson.callout}</div>`;
  }

  lessonView.style.setProperty("--card-accent", course.accent);
  lessonView.innerHTML = `
    <p class="lesson__eyebrow">${lesson.eyebrow} · ${course.name}</p>
    <h2 class="lesson__title">${lesson.title}</h2>
    <div class="lesson__content">${lesson.content}</div>
    ${codeHtml}
    ${calloutHtml}
    <div class="lesson__nav">
      <button class="navbtn" id="prevBtn" ${idx === 0 ? "disabled" : ""}>← предыдущий урок</button>
      <button class="navbtn navbtn--complete" id="completeBtn">${done ? "✓ урок пройден" : "отметить как пройденный"}</button>
      <button class="navbtn" id="nextBtn" ${idx === total-1 ? "disabled" : ""}>следующий урок →</button>
    </div>
  `;

  document.getElementById("prevBtn").addEventListener("click", () => {
    if(idx > 0){ state.currentLessonIndex--; renderSidebar(); renderLesson(); window.scrollTo({top:0}); }
  });
  document.getElementById("nextBtn").addEventListener("click", () => {
    if(idx < total-1){ state.currentLessonIndex++; renderSidebar(); renderLesson(); window.scrollTo({top:0}); }
  });
  document.getElementById("completeBtn").addEventListener("click", () => {
    const nowDone = !isLessonDone(state.currentLang, idx);
    setLessonDone(state.currentLang, idx, nowDone);
    renderSidebar();
    renderLesson();
  });
}

/* ========================= EVENTS & INIT ========================= */

document.getElementById("backBtn").addEventListener("click", closeCourse);
document.getElementById("brandHome").addEventListener("click", closeCourse);

renderLangGrid();
