# Polywrap Wrapper Runner (PWR)

## Description
Polywrap Wrapper Runner (PWR) is a CLI application for running Polywrap wrappers.
It uses the PolywrapClient to execute any wrapper that implements the PwrApp interface wrap://ens/pwr-app.eth
```graphql
type Module {
  main(args: [String!]!): UInt8!
}
```

## Examples: 
Input: `pwr wrap://ens/wrap-echo.eth Hello world!`
Output: `Hello world!`

Input: `pwr ens/wrap-echo.eth Hello world!`
Output: `Hello world!`

Input: `pwr wrap-echo.eth Hello world!`
Output: `Hello world!`

Input: `pwr wrap://ipfs/Qm Hello world!`
Output: `Hello world!`

Input: `pwr ipfs/Qm Hello world!`
Output: `Hello world!`

Input: `pwr ipfs://Qm Hello world!`
Output: `Hello world!`

Input: `pwr Qm Hello world!`
Output: `Hello world!`
