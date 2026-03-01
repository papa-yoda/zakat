# Objective
Create an app that will let me calculate my Zakat owed by tracking my assets such as retirements, investments and jewlery.

# Requirements
I want to be able to track assets in the following category:
- Retirement accounts
- Short-term investments
- long-term investments
- Savings
- Gold
- Silver

I would like the app to be running as a service locally which other computers on my network can access. I want the data to be persistent.

## Features
For Retirement accounts:
- I want it to account for early withdrawal penlty and taxes before using that amount in Zakat calculations
- I want the withdrawl penalty percentage to be defaulted to the current percentage but allow me to override it
- I want the tax rate to be defaulted to 33% but let me override it
For investments:
- Let me enter number of stocks and ticker and purchase date
- based on that information, I want to be able to calculate the total value and determine if its long-term and short-term
For savings:
- I just want to enter a flat $ amount for savings
For Jewlery (gold and silver):
- I want track type (gold or silver) and weight (in grams) 
- I want the value calculated based on the current price of gold and silver
Additional features:
- For each asset type, I want to be able to include/exclude them in the zakat calculations. 
- I want the app to take nisab into account when calculating zakat
