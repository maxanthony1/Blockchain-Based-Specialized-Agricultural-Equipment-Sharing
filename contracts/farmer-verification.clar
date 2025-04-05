;; Farmer Verification Contract
;; Validates legitimate agricultural operators

;; Define data maps
(define-map verified-farmers
  { farmer: principal }
  {
    is-verified: bool,
    verification-date: uint,
    farm-details: (string-utf8 200)
  }
)

(define-map verification-authorities
  { authority: principal }
  { is-active: bool }
)

;; Define data variables
(define-data-var contract-owner principal tx-sender)

;; Define public functions
(define-public (register-authority (authority principal))
  (begin
    (asserts! (is-eq tx-sender (var-get contract-owner)) (err u1))
    (map-set verification-authorities
      { authority: authority }
      { is-active: true }
    )
    (ok true)
  )
)

(define-public (verify-farmer (farmer principal) (farm-details (string-utf8 200)))
  (begin
    (asserts! (is-authority tx-sender) (err u2))
    (map-set verified-farmers
      { farmer: farmer }
      {
        is-verified: true,
        verification-date: block-height,
        farm-details: farm-details
      }
    )
    (ok true)
  )
)

(define-public (revoke-verification (farmer principal))
  (begin
    (asserts! (is-authority tx-sender) (err u2))
    (map-delete verified-farmers { farmer: farmer })
    (ok true)
  )
)

(define-read-only (is-verified (farmer principal))
  (default-to false (get is-verified (map-get? verified-farmers { farmer: farmer })))
)

(define-read-only (is-authority (authority principal))
  (default-to false (get is-active (map-get? verification-authorities { authority: authority })))
)
