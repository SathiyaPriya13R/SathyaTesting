export class Queries {

    week_wise_statistics_count = `SELECT
	FORMAT(insurance_followup.ModifiedDate, 'yyyy') AS year,
	FORMAT(insurance_followup.ModifiedDate, 'MMM') AS month,
	DATEDIFF(WEEK, DATEADD(MONTH, DATEDIFF(MONTH, 0, insurance_followup.ModifiedDate), 0), insurance_followup.ModifiedDate) + 1 AS week_number,
	lookup_value.Name AS status,
	lookup_value.LookupValueID AS LookupValueID,
	COUNT(lookup_value.Name) AS status_count
FROM
	pvdr.InsuranceTransaction insurance_transaction
LEFT JOIN pvdr.GroupInsurance group_insurance ON
	(group_insurance.GroupInsuranceID = insurance_transaction.GroupInsuranceID)
LEFT JOIN [ref].InsuranceMaster insurance_master ON
	(insurance_master.InsuranceID = group_insurance.InsuranceID)
INNER JOIN pvdr.InsuranceFollowup insurance_followup ON
	(insurance_followup.InsuranceTransactionID = insurance_transaction.InsuranceTransactionID
		AND insurance_followup.IsLast = 1)
INNER JOIN [ref].LookupValue lookup_value on
	(lookup_value.LookupValueID = insurance_followup.StatusID)
WHERE
	(CASE
		WHEN :user_type = 'Group' THEN insurance_transaction.ProviderGroupID
		ELSE insurance_transaction.ProviderDoctorID
	END ) IN (:user_id)
	AND insurance_followup.ModifiedDate >= DATEADD(DAY, -180, GETDATE())
	:monthquery:
    :weeknumquery:
    :providersquery:
    :payersquery:
    :locationsquery:
GROUP BY
	FORMAT(insurance_followup.ModifiedDate, 'yyyy'),
	FORMAT(insurance_followup.ModifiedDate, 'MMM'),
	DATEDIFF(WEEK, DATEADD(MONTH, DATEDIFF(MONTH, 0, insurance_followup.ModifiedDate), 0), insurance_followup.ModifiedDate) + 1,
	lookup_value.LookupValueID,
	lookup_value.Name
ORDER BY
	year`

    //     week = `SELECT
    // 	FORMAT(insurance_followup.ModifiedDate, 'yyyy') AS year,
    // 	FORMAT(insurance_followup.ModifiedDate, 'MMM') AS month,
    // 	(DATEPART(WEEK, insurance_followup.ModifiedDate) - 1 ) AS week_number,
    // 	lookup_value.Name AS status,
    //     lookup_value.LookupValueID AS LookupValueID,
    // 	COUNT(lookup_value.Name) AS status_count
    // FROM
    // 	pvdr.InsuranceTransaction insurance_transaction
    // LEFT JOIN pvdr.GroupInsurance group_insurance ON
    // 	(group_insurance.GroupInsuranceID = insurance_transaction.GroupInsuranceID)
    // LEFT JOIN [ref].InsuranceMaster insurance_master ON
    // 	(insurance_master.InsuranceID = group_insurance.InsuranceID)
    // INNER JOIN pvdr.InsuranceFollowup insurance_followup ON
    // 	(insurance_followup.InsuranceTransactionID = insurance_transaction.InsuranceTransactionID
    // 		AND insurance_followup.IsLast = 1)
    // INNER JOIN [ref].LookupValue lookup_value on
    // 	(lookup_value.LookupValueID = insurance_followup.StatusID)
    // WHERE
    // 	(CASE
    // 		WHEN :user_type = 'Group' THEN insurance_transaction.ProviderGroupID
    // 		ELSE insurance_transaction.ProviderDoctorID
    // 	END ) IN (:user_id)
    // 	AND
    //     insurance_followup.ModifiedDate >= DATEADD(DAY, -1024, GETDATE())
    // 	AND
    //     FORMAT(insurance_followup.ModifiedDate, 'yyyy MMM') = :month
    //     :providersquery:
    //     :payersquery:
    //     :locationsquery:
    // GROUP BY
    // 	FORMAT(insurance_followup.ModifiedDate, 'yyyy'),
    // 	FORMAT(insurance_followup.ModifiedDate, 'MMM'),
    // 	DATEPART(WEEK, insurance_followup.ModifiedDate),
    //     lookup_value.LookupValueID,
    // 	lookup_value.Name
    // ORDER BY
    // 	year,
    // 	month,
    // 	week_number,
    //     lookup_value.LookupValueID,
    // 	lookup_value.Name;`

    month_wise_statistics_count = `SELECT
    FORMAT(insurance_followup.ModifiedDate, 'yyyy') AS year,
    FORMAT(insurance_followup.ModifiedDate, 'MMM') AS month,
    lookup_value.Name AS status,
    lookup_value.LookupValueID AS LookupValueID,
    COUNT(lookup_value.Name) AS status_count
FROM
    pvdr.InsuranceTransaction insurance_transaction
LEFT JOIN pvdr.GroupInsurance group_insurance ON
    (group_insurance.GroupInsuranceID = insurance_transaction.GroupInsuranceID)
LEFT JOIN [ref].InsuranceMaster insurance_master ON
    (insurance_master.InsuranceID = group_insurance.InsuranceID)
INNER JOIN pvdr.InsuranceFollowup insurance_followup ON
    (insurance_followup.InsuranceTransactionID = insurance_transaction.InsuranceTransactionID AND insurance_followup.IsLast = 1)
INNER JOIN [ref].LookupValue lookup_value on
    (lookup_value.LookupValueID = insurance_followup.StatusID)
WHERE
    (CASE
        WHEN :user_type = 'Group' THEN insurance_transaction.ProviderGroupID
        ELSE insurance_transaction.ProviderDoctorID
    END ) IN (:user_id)
    AND
    insurance_followup.ModifiedDate >= DATEADD(DAY, -180, GETDATE())
    AND
    FORMAT(insurance_followup.ModifiedDate, 'yyyy MMM') = :month
    :providersquery:
    :payersquery:
    :locationsquery:
GROUP BY
    FORMAT(insurance_followup.ModifiedDate, 'yyyy'),
    FORMAT(insurance_followup.ModifiedDate, 'MMM'),
    lookup_value.LookupValueID,
    lookup_value.Name
ORDER BY
    year,
    month,
    lookup_value.LookupValueID,
    lookup_value.Name;`

}

export const queries = new Queries()