/**
 * Dated event markers for time-series charts. Each marker is a verifiable
 * public fact (policy announcement, rate change, crisis) with the date it
 * happened. Markers are contextual, never causal claims: the charts show
 * that the event and the series moved in the same window, nothing more.
 */

export interface ChartEventMarker {
  /** Category value on the chart x-axis (matches the series label). */
  x: string | number;
  /** Short label shown in the legend under the chart. */
  label: string;
  /** Where the fact is documented. */
  citation: string;
}

/**
 * Main benefit chart markers, September 2013 to September 2018. The
 * welfare-reform change sits on the first quarter of the series, and the
 * government change on the December 2017 quarter that followed the election.
 */
export const BENEFIT_EVENTS: ChartEventMarker[] = [
  {
    x: 'Sep 2013',
    label: 'Jobseeker Support begins',
    citation:
      'The Welfare Reform Act 2012 replaced older benefits with Jobseeker Support from 15 July 2013.',
  },
  {
    x: 'Dec 2017',
    label: 'Government change',
    citation:
      'The 2017 general election was held on 23 September, and the Labour-led government was sworn in on 26 October 2017.',
  },
];

/** Road-user casualty chart markers, 1990 to 2016. */
export const ROAD_CASUALTY_EVENTS: ChartEventMarker[] = [
  {
    x: 2014,
    label: 'Drink-drive limit lowered',
    citation:
      'The adult blood-alcohol limit dropped from 80mg to 50mg per 100ml on 1 December 2014.',
  },
];
