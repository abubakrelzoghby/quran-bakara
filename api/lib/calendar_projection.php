<?php
declare(strict_types=1);

function calendar_projection_parse_date(string $dateString, string $fieldName): DateTimeImmutable
{
    if (strpos($dateString, "\0") !== false) {
        throw new InvalidArgumentException($fieldName . ' must be a valid Y-m-d date string.');
    }

    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $dateString);
    $errors = DateTimeImmutable::getLastErrors();

    if (
        $date === false
        || ($errors !== false && ($errors['warning_count'] > 0 || $errors['error_count'] > 0))
        || $date->format('Y-m-d') !== $dateString
    ) {
        throw new InvalidArgumentException($fieldName . ' must be a valid Y-m-d date string.');
    }

    return $date;
}

function calendar_projection_anchor_friday(string $anchorFriday): DateTimeImmutable
{
    $anchorDate = calendar_projection_parse_date($anchorFriday, 'Anchor date');

    if ((int) $anchorDate->format('N') !== 5) {
        throw new InvalidArgumentException('Anchor date must be a Friday.');
    }

    return $anchorDate;
}

function calendar_projection_normalize_week_index($weekIndex): int
{
    if (!is_int($weekIndex) || $weekIndex < 1) {
        throw new InvalidArgumentException('Week index must be a positive integer.');
    }

    return $weekIndex;
}

function calendar_projection_project_week($anchorFriday, $weekIndex): array
{
    if (!is_string($anchorFriday)) {
        throw new InvalidArgumentException('Anchor date must be a valid Y-m-d date string.');
    }

    $anchorDate = calendar_projection_anchor_friday($anchorFriday);
    $normalizedWeekIndex = calendar_projection_normalize_week_index($weekIndex);
    $startDate = $anchorDate->modify('+' . (($normalizedWeekIndex - 1) * 7) . ' days');
    $endDate = $startDate->modify('+6 days');
    $days = [];

    for ($dayOffset = 0; $dayOffset < 7; $dayOffset++) {
        $date = $startDate->modify('+' . $dayOffset . ' days');
        $dayIndex = $dayOffset + 1;

        $days[] = [
            'dayIndex' => $dayIndex,
            'date' => $date->format('Y-m-d'),
            'weekdayIso' => (int) $date->format('N'),
            'isReadingDay' => $dayIndex >= 1 && $dayIndex <= 6,
            'isCatchUpDay' => $dayIndex === 7,
        ];
    }

    return [
        'weekIndex' => $normalizedWeekIndex,
        'anchorDate' => $anchorDate->format('Y-m-d'),
        'startDate' => $startDate->format('Y-m-d'),
        'endDate' => $endDate->format('Y-m-d'),
        'readingDayIndices' => [1, 2, 3, 4, 5, 6],
        'catchUpDayIndex' => 7,
        'days' => $days,
    ];
}

function calendar_projection_current_week_index($anchorFriday, $todayDate = null): int
{
    if (!is_string($anchorFriday)) {
        throw new InvalidArgumentException('Anchor date must be a valid Y-m-d date string.');
    }

    $anchorDate = calendar_projection_anchor_friday($anchorFriday);

    if ($todayDate === null) {
        $today = new DateTimeImmutable('today');
    } elseif (is_string($todayDate)) {
        $today = calendar_projection_parse_date($todayDate, 'Today date');
    } else {
        throw new InvalidArgumentException('Today date must be a valid Y-m-d date string.');
    }

    if ($today < $anchorDate) {
        return 1;
    }

    return intdiv((int) $anchorDate->diff($today)->days, 7) + 1;
}
