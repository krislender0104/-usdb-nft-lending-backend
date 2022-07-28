export enum NotificationStatus {
  Read = 'READ',
  Unread = 'UNREAD',
}

export enum NotificationContext {
  NewLoan = "NEW_LOAN",
  Repayment = "REPAYMENT",
  Liquidation = "LIQUIDATION",
  NewOffer = "NEW_OFFER",
  OfferAccepted = "OFFER_ACCEPTED",
  OfferCancelled = "OFFER_CANCELLED",
  ListingCancelled = "LISTING_CANCELLED",
}

export enum UserType {
  Lender = "LENDER",
  Borrower = "BORROWER",
}