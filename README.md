# tax-calculator
Stupid simple federal tax calculator. (Only Single filing for federal taxes)

There are a few `.jsonc` files in the `tax-brackets` folder. If you want to use one that doesn't exist just follow the format and import it through when you run the script. 

## Installation
Clone the repo `git clone https://github.com/ironweber/tax-calculator.git`

Install [deno](https://docs.deno.com/runtime/getting_started/installation/)

## Usage

### Compile the code:
```
deno compile --allow-read main.ts
```

### Run the script:
```
./tax-calculator --taxYear 2023 --income 100000
````

