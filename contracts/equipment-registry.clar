;; Equipment Registry Contract
;; Records details of seasonal farm machinery

;; Define data variables
(define-data-var last-equipment-id uint u0)

;; Define data maps
(define-map equipment-registry
  { equipment-id: uint }
  {
    owner: principal,
    equipment-type: (string-utf8 50),
    specifications: (string-utf8 200),
    is-available: bool,
    registration-date: uint
  }
)

;; Define public functions
(define-public (register-equipment (equipment-type (string-utf8 50)) (specifications (string-utf8 200)))
  (let
    (
      (new-id (+ (var-get last-equipment-id) u1))
    )
    (begin
      (var-set last-equipment-id new-id)
      (map-set equipment-registry
        { equipment-id: new-id }
        {
          owner: tx-sender,
          equipment-type: equipment-type,
          specifications: specifications,
          is-available: true,
          registration-date: block-height
        }
      )
      (ok new-id)
    )
  )
)

(define-public (update-availability (equipment-id uint) (is-available bool))
  (let
    (
      (equipment-data (unwrap! (map-get? equipment-registry { equipment-id: equipment-id }) (err u1)))
    )
    (begin
      (asserts! (is-eq tx-sender (get owner equipment-data)) (err u2))
      (map-set equipment-registry
        { equipment-id: equipment-id }
        (merge equipment-data { is-available: is-available })
      )
      (ok true)
    )
  )
)

(define-read-only (get-equipment (equipment-id uint))
  (map-get? equipment-registry { equipment-id: equipment-id })
)

(define-read-only (get-equipment-count)
  (var-get last-equipment-id)
)
