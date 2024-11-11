import {parseArgs} from '@std/cli/parse-args';
import {parse} from '@std/jsonc';

function convertToCurrency(num: number) {
  const roundedNumber = num.toFixed(2);
  const numWithComma = roundedNumber.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
  return `$${numWithComma}`;
}
function main() {
  const Args = parseArgs(Deno.args);

  const INCOME = Args.income;
  const TAX_YEAR = Args.taxYear;

  const standardDeductionFile = Deno.readTextFileSync('./standard-deductions.jsonc');
  const standardDeductionData = parse(standardDeductionFile) as {[key: string]: number};
  const STANDARD_DEDUCTION = standardDeductionData?.[TAX_YEAR];

  console.log('-------------------');
  console.log('TAX YEAR:', TAX_YEAR);
  console.log('INCOME:', INCOME);
  console.log('STANDARD DEDUCTION: ', convertToCurrency(STANDARD_DEDUCTION));
  console.log('TAXABLE INCOME: ', convertToCurrency(INCOME-STANDARD_DEDUCTION));
  console.log('-------------------');

  const income = INCOME - STANDARD_DEDUCTION;
  let totalTaxesOwed = 0;

  const bracketsFile = Deno.readTextFileSync(`./tax-brackets/${TAX_YEAR}.jsonc`);

  const bracketsData = parse(bracketsFile) as {brackets: { rate: number; amount: number; }[]};
  const BRACKETS = bracketsData.brackets;

  for (const [idx, currentBracket] of BRACKETS.entries()) {
    const previousBracketAmount = BRACKETS[idx - 1]?.amount + 1 || 0;
    let taxableIncome = (currentBracket.amount) - previousBracketAmount;
    if (previousBracketAmount > income && currentBracket.amount > income) {
      break;
    } else {
      if (currentBracket.amount > income && previousBracketAmount < income) {
        taxableIncome = income - previousBracketAmount;
      }
      console.log('-------------------');
      console.log('BRACKET: ', `${currentBracket.rate*100}%`, `${convertToCurrency(previousBracketAmount)}-${convertToCurrency(currentBracket.amount)}`);
      console.log('AMOUNT TAXABLE: ',convertToCurrency(taxableIncome));
      console.log('TAXES OWED FOR CURRENT BRACKET: ', convertToCurrency(taxableIncome * currentBracket.rate));
      console.log('-------------------');
      totalTaxesOwed = totalTaxesOwed + (taxableIncome * currentBracket.rate);
    }
  }

  console.log('EFFECTIVE TAX RATE: ', `${Math.round((totalTaxesOwed/income) *
    100)}%`);
  console.log('ESTIMATED FED TAXES OWED: ', convertToCurrency(totalTaxesOwed));
}
main();
